import time
from functools import wraps
from typing import Callable, Awaitable
from uuid import UUID

import bcrypt
import jwt
from quart import request, g

from core.config import settings
from models import User


def _pepper(password: str) -> bytes:
    return (password + settings.bcrypt_pepper).encode("utf-8")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_pepper(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(_pepper(password), password_hash.encode("utf-8"))
    except ValueError:
        return False


def issue_token(user_id: UUID) -> str:
    now = int(time.time())
    payload = {"sub": str(user_id), "iat": now, "exp": now + settings.jwt_ttl_seconds}
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_token(token: str) -> UUID:
    payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    return UUID(payload["sub"])


def _extract_bearer() -> str | None:
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    return header[len("Bearer "):].strip() or None


def require_auth(func: Callable[..., Awaitable]):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        token = _extract_bearer()
        if token is None:
            return {"error": "missing_token"}, 401
        try:
            user_id = decode_token(token)
        except jwt.PyJWTError:
            return {"error": "invalid_token"}, 401
        user = await User.get_or_none(id=user_id)
        if user is None:
            return {"error": "invalid_token"}, 401
        g.current_user = user
        return await func(*args, **kwargs)

    return wrapper


def require_admin(func: Callable[..., Awaitable]):
    @wraps(func)
    @require_auth
    async def wrapper(*args, **kwargs):
        if not g.current_user.is_admin:
            return {"error": "forbidden"}, 403
        return await func(*args, **kwargs)

    return wrapper
