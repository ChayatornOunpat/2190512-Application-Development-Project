from pathlib import Path

from quart import Blueprint, send_file
from quart_schema import hide

from core.config import settings
from core.security import require_auth


bp = Blueprint("templates", __name__, url_prefix="/templates")


@bp.get("/<string:name>")
@hide
@require_auth
async def download_template(name: str):
    safe = Path(name).name
    if not safe or safe != name:
        return {"error": "invalid_name"}, 400

    path = Path(settings.templates_dir) / safe
    if not path.is_file():
        return {"error": "not_found"}, 404

    return await send_file(str(path), mimetype="application/octet-stream")
