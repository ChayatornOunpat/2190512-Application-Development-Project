from quart import Blueprint, g
from quart_schema import security_scheme, tag, validate_request, validate_response

from core.security import issue_token, require_auth, verify_password
from models import User

from .schemas import (
    CurrentUserResponse,
    ErrorResponse,
    OkResponse,
    SignInRequest,
    SignInResponse,
)


bp = Blueprint("auth", __name__, url_prefix="/auth")


@bp.post("/sign-in")
@tag(["auth"])
@security_scheme([])
@validate_request(SignInRequest)
@validate_response(SignInResponse, 200)
@validate_response(ErrorResponse, 401)
async def sign_in(data: SignInRequest):
    user = await User.get_or_none(email=data.email)
    if user is None or not verify_password(data.password, user.password_hash):
        return ErrorResponse(error="invalid_credentials"), 401

    token = issue_token(user.id)
    return SignInResponse(token=token, uid=user.id, email=user.email, is_admin=user.is_admin)


@bp.post("/sign-out")
@tag(["auth"])
@validate_response(OkResponse, 200)
@require_auth
async def sign_out():
    return OkResponse()


@bp.get("/me")
@tag(["auth"])
@validate_response(CurrentUserResponse, 200)
@require_auth
async def me():
    user: User = g.current_user
    return CurrentUserResponse(uid=user.id, email=user.email, is_admin=user.is_admin)
