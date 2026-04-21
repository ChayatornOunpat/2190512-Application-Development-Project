from .auth import bp as auth_bp
from .plates import bp as plates_bp
from .sessions import bp as sessions_bp
from .plate_locks import bp as plate_locks_bp
from .usage import bp as usage_bp
from .submissions import bp as submissions_bp
from .templates import bp as templates_bp
from .ws import bp as ws_bp


all_blueprints = (
    auth_bp,
    plates_bp,
    sessions_bp,
    plate_locks_bp,
    usage_bp,
    submissions_bp,
    templates_bp,
    ws_bp,
)
