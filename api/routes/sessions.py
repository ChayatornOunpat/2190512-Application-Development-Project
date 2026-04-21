from uuid import UUID

from quart import Blueprint, g
from quart_schema import tag, validate_request, validate_response

from core.realtime import hub
from core.security import require_auth
from models import WorkingSession

from .schemas import (
    ErrorResponse,
    OkResponse,
    StartSessionRequest,
    WorkingSessionEnvelope,
    WorkingSessionResponse,
)


bp = Blueprint("sessions", __name__, url_prefix="/sessions")


FIELD_TO_COLUMN = {
    "rest1": "rest1",
    "rest2": "rest2",
    "destination": "destination",
    "passRest1": "pass_rest1",
    "passRest2": "pass_rest2",
    "passDestination": "pass_destination",
}


def _to_response(ws: WorkingSession) -> WorkingSessionResponse:
    return WorkingSessionResponse(
        plate=ws.plate,
        working=ws.working,
        rest1=ws.rest1,
        rest2=ws.rest2,
        destination=ws.destination,
        pass_rest1=ws.pass_rest1,
        pass_rest2=ws.pass_rest2,
        pass_destination=ws.pass_destination,
    )


@bp.get("/me")
@tag(["sessions"])
@validate_response(WorkingSessionEnvelope, 200)
@require_auth
async def get_mine():
    ws = await WorkingSession.get_or_none(user_id=g.current_user.id)
    if ws is None:
        return WorkingSessionEnvelope(session=None)
    return WorkingSessionEnvelope(session=_to_response(ws))


@bp.post("/start")
@tag(["sessions"])
@validate_request(StartSessionRequest)
@validate_response(WorkingSessionResponse, 200)
@require_auth
async def start_session(data: StartSessionRequest):
    ws, _ = await WorkingSession.update_or_create(
        user_id=g.current_user.id,
        defaults={
            "plate": data.plate,
            "working": True,
            "rest1": False,
            "rest2": False,
            "destination": False,
            "pass_rest1": False,
            "pass_rest2": False,
            "pass_destination": False,
        },
    )
    await _broadcast_all(g.current_user.id, ws)
    return _to_response(ws)


@bp.post("/checkpoint/<string:field>")
@tag(["sessions"])
@validate_response(WorkingSessionResponse, 200)
@validate_response(ErrorResponse, 400)
@validate_response(ErrorResponse, 404)
@require_auth
async def mark_checkpoint(field: str):
    column = FIELD_TO_COLUMN.get(field)
    if column is None:
        return ErrorResponse(error="unknown_field"), 400

    ws = await WorkingSession.get_or_none(user_id=g.current_user.id)
    if ws is None:
        return ErrorResponse(error="no_session"), 404

    setattr(ws, column, True)
    await ws.save(update_fields=[column])
    await hub.publish(g.current_user.id, {"type": "field", "field": field, "value": True})
    return _to_response(ws)


@bp.post("/end")
@tag(["sessions"])
@validate_response(OkResponse, 200)
@require_auth
async def end_session():
    deleted = await WorkingSession.filter(user_id=g.current_user.id).delete()
    if deleted:
        await hub.publish(g.current_user.id, {"type": "field", "field": "working", "value": False})
    return OkResponse()


async def _broadcast_all(user_id: UUID, ws: WorkingSession) -> None:
    snapshot = {
        "plate": ws.plate,
        "working": ws.working,
        "rest1": ws.rest1,
        "rest2": ws.rest2,
        "destination": ws.destination,
        "passRest1": ws.pass_rest1,
        "passRest2": ws.pass_rest2,
        "passDestination": ws.pass_destination,
    }
    for field, value in snapshot.items():
        await hub.publish(user_id, {"type": "field", "field": field, "value": value})
