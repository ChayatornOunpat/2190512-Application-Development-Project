from quart import Blueprint, g
from quart_schema import tag, validate_request, validate_response

from core.security import require_auth
from models import Plate, PlateLock

from .schemas import ClaimConflictResponse, ClaimPlateLockRequest, ErrorResponse, OkResponse, PlateLockResponse


bp = Blueprint("plate_locks", __name__, url_prefix="/plate-locks")


@bp.get("/<string:plate>")
@tag(["plate-locks"])
@validate_response(PlateLockResponse, 200)
@require_auth
async def get_lock(plate: str):
    lock = await PlateLock.get_or_none(plate_id=plate)
    if lock is None:
        return PlateLockResponse(holder_uid=None, ref_date=None, usage=None)
    return PlateLockResponse(holder_uid=lock.holder_id, ref_date=lock.ref_date, usage=lock.usage)


@bp.post("/claim")
@tag(["plate-locks"])
@validate_request(ClaimPlateLockRequest)
@validate_response(OkResponse, 200)
@validate_response(ErrorResponse, 404)
@validate_response(ClaimConflictResponse, 409)
@require_auth
async def claim_lock(data: ClaimPlateLockRequest):
    plate = await Plate.get_or_none(code=data.plate)
    if plate is None:
        return ErrorResponse(error="unknown_plate"), 404

    existing = await PlateLock.get_or_none(plate_id=data.plate)
    if existing is not None and existing.holder_id != g.current_user.id:
        return ClaimConflictResponse(error="plate_locked", holder_uid=existing.holder_id), 409

    await PlateLock.update_or_create(
        plate_id=data.plate,
        defaults={
            "holder_id": g.current_user.id,
            "ref_date": data.ref_date,
            "usage": data.usage,
        },
    )
    return OkResponse()


@bp.delete("/<string:plate>")
@tag(["plate-locks"])
@validate_response(OkResponse, 200)
@require_auth
async def release_lock(plate: str):
    await PlateLock.filter(plate_id=plate, holder_id=g.current_user.id).delete()
    return OkResponse()
