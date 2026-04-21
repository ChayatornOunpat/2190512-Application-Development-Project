from quart import Blueprint
from quart_schema import tag, validate_request, validate_response
from tortoise.transactions import in_transaction

from core.security import require_admin, require_auth
from models import Plate

from .schemas import OkResponse, PlatesResponse, ReplacePlatesRequest


bp = Blueprint("plates", __name__, url_prefix="/plates")


@bp.get("")
@tag(["plates"])
@validate_response(PlatesResponse, 200)
@require_auth
async def list_plates():
    rows = await Plate.all().values_list("code", flat=True)
    return PlatesResponse(plates=list(rows))


@bp.put("")
@tag(["plates"])
@validate_request(ReplacePlatesRequest)
@validate_response(OkResponse, 200)
@require_admin
async def replace_plates(data: ReplacePlatesRequest):
    async with in_transaction():
        await Plate.all().delete()
        if data.plates:
            await Plate.bulk_create([Plate(code=code) for code in data.plates])
    return OkResponse()
