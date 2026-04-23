from pydantic import BaseModel
from quart import Blueprint
from quart_schema import tag, validate_querystring, validate_request, validate_response

from core.security import require_admin, require_auth
from models import PlateDailyUsage, PlateLock

from .schemas import (
    OkResponse,
    RecordHistoricalSessionRequest,
    UsageCountResponse,
    UsageDateResponse,
)


bp = Blueprint("usage", __name__, url_prefix="/usage")


class HistoricalCountQuery(BaseModel):
    date: str


@bp.get("/current/<string:plate>/index")
@tag(["usage"])
@validate_response(UsageCountResponse, 200)
@require_auth
async def current_index(plate: str):
    lock = await PlateLock.get_or_none(plate_id=plate)
    count = 0 if lock is None else lock.usage
    return UsageCountResponse(count=count)


@bp.get("/current/<string:plate>/date")
@tag(["usage"])
@validate_response(UsageDateResponse, 200)
@require_auth
async def current_date(plate: str):
    lock = await PlateLock.get_or_none(plate_id=plate)
    return UsageDateResponse(date=None if lock is None else lock.ref_date)


@bp.get("/historical/<string:plate>/count")
@tag(["usage"])
@validate_querystring(HistoricalCountQuery)
@validate_response(UsageCountResponse, 200)
@require_admin
async def historical_count(plate: str, query_args: HistoricalCountQuery):
    row = await PlateDailyUsage.get_or_none(plate_id=plate, date=query_args.date)
    return UsageCountResponse(count=0 if row is None else row.count)


@bp.get("/next/<string:plate>/count")
@tag(["usage"])
@validate_querystring(HistoricalCountQuery)
@validate_response(UsageCountResponse, 200)
@require_auth
async def next_session_count(plate: str, query_args: HistoricalCountQuery):
    row = await PlateDailyUsage.get_or_none(plate_id=plate, date=query_args.date)
    return UsageCountResponse(count=(0 if row is None else row.count) + 1)


@bp.post("/historical/record")
@tag(["usage"])
@validate_request(RecordHistoricalSessionRequest)
@validate_response(OkResponse, 200)
@require_auth
async def record_historical(data: RecordHistoricalSessionRequest):
    row, created = await PlateDailyUsage.get_or_create(
        plate_id=data.plate, date=data.date, defaults={"count": data.count}
    )
    if not created and row.count < data.count:
        row.count = data.count
        await row.save(update_fields=["count"])
    return OkResponse()
