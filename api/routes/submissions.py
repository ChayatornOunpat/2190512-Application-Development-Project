from quart import Blueprint, g
from quart_schema import tag, validate_request, validate_response
from tortoise.transactions import in_transaction

from core.security import require_auth
from models import Plate, SessionCheck, SessionCheckpoint, SessionSubmission

from .schemas import (
    CheckpointEnvelope,
    CheckpointPayload,
    ErrorResponse,
    OkResponse,
    SessionSubmissionPayload,
    SubmissionEnvelope,
    SubmissionIdResponse,
)


bp = Blueprint("submissions", __name__, url_prefix="/submissions")


@bp.post("")
@tag(["submissions"])
@validate_request(SessionSubmissionPayload)
@validate_response(SubmissionIdResponse, 200)
@validate_response(ErrorResponse, 404)
@require_auth
async def upload_submission(data: SessionSubmissionPayload):
    plate = await Plate.get_or_none(code=data.plate)
    if plate is None:
        return ErrorResponse(error="unknown_plate"), 404

    async with in_transaction():
        submission, _ = await SessionSubmission.update_or_create(
            plate_id=data.plate,
            date=data.date,
            count=data.count,
            defaults={
                "driver_id": g.current_user.id,
                "driver_name": data.driver_name,
                "mile": data.mile,
                "start_location": data.start_location,
                "alcohol": data.alcohol,
                "drug": data.drug,
            },
        )
        await SessionCheck.filter(submission_id=submission.id).delete()
        await SessionCheck.bulk_create([
            SessionCheck(
                submission_id=submission.id,
                field=item.field,
                passed=item.passed,
                note=item.note,
                fix=item.fix,
            )
            for item in data.checks
        ])

    return SubmissionIdResponse(id=submission.id)


@bp.get("/<string:plate>/<string:date>/<int:count>")
@tag(["submissions"])
@validate_response(SubmissionEnvelope, 200)
@require_auth
async def get_submission(plate: str, date: str, count: int):
    submission = await SessionSubmission.get_or_none(plate_id=plate, date=date, count=count)
    if submission is None:
        return SubmissionEnvelope(submission=None)

    checks = await SessionCheck.filter(submission_id=submission.id).all()
    checkpoints = await SessionCheckpoint.filter(submission_id=submission.id).all()

    return SubmissionEnvelope(submission={
        "id": str(submission.id),
        "plate": submission.plate_id,
        "date": submission.date,
        "count": submission.count,
        "driver_name": submission.driver_name,
        "mile": submission.mile,
        "start_location": submission.start_location,
        "alcohol": submission.alcohol,
        "drug": submission.drug,
        "checks": [
            {"field": c.field.value, "passed": c.passed, "note": c.note, "fix": c.fix}
            for c in checks
        ],
        "checkpoints": [
            {"suffix": cp.suffix.value, "time": cp.time, "location": cp.location}
            for cp in checkpoints
        ],
    })


@bp.post("/<string:plate>/<string:date>/<int:count>/checkpoints/<string:suffix>")
@tag(["submissions"])
@validate_request(CheckpointPayload)
@validate_response(OkResponse, 200)
@validate_response(ErrorResponse, 404)
@require_auth
async def upload_checkpoint(plate: str, date: str, count: int, suffix: str, data: CheckpointPayload):
    submission = await SessionSubmission.get_or_none(plate_id=plate, date=date, count=count)
    if submission is None:
        return ErrorResponse(error="unknown_submission"), 404

    await SessionCheckpoint.update_or_create(
        submission_id=submission.id,
        suffix=suffix,
        defaults={"time": data.time, "location": data.location},
    )
    return OkResponse()


@bp.get("/<string:plate>/<string:date>/<int:count>/checkpoints/<string:suffix>")
@tag(["submissions"])
@validate_response(CheckpointEnvelope, 200)
@require_auth
async def get_checkpoint(plate: str, date: str, count: int, suffix: str):
    submission = await SessionSubmission.get_or_none(plate_id=plate, date=date, count=count)
    if submission is None:
        return CheckpointEnvelope(checkpoint=None)
    cp = await SessionCheckpoint.get_or_none(submission_id=submission.id, suffix=suffix)
    if cp is None:
        return CheckpointEnvelope(checkpoint=None)
    return CheckpointEnvelope(checkpoint=CheckpointPayload(time=cp.time, location=cp.location))
