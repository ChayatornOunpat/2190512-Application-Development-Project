from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from models import CheckFieldEnum, CheckpointSuffixEnum


class OkResponse(BaseModel):
    ok: bool = True


class ErrorResponse(BaseModel):
    error: str
    detail: list[dict] | str | None = None


class SubmissionIdResponse(BaseModel):
    id: UUID


class WorkingSessionEnvelope(BaseModel):
    session: "WorkingSessionResponse | None" = None


class SubmissionEnvelope(BaseModel):
    submission: dict | None = None


class CheckpointEnvelope(BaseModel):
    checkpoint: "CheckpointPayload | None" = None


class ClaimConflictResponse(BaseModel):
    error: str
    holder_uid: UUID | None = None


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class SignInResponse(BaseModel):
    token: str
    uid: UUID
    email: EmailStr
    is_admin: bool


class CurrentUserResponse(BaseModel):
    uid: UUID
    email: EmailStr
    is_admin: bool


class PlatesResponse(BaseModel):
    plates: list[str]


class ReplacePlatesRequest(BaseModel):
    plates: list[str]


class WorkingSessionResponse(BaseModel):
    plate: str
    working: bool
    rest1: bool
    rest2: bool
    destination: bool
    pass_rest1: bool = Field(alias="passRest1")
    pass_rest2: bool = Field(alias="passRest2")
    pass_destination: bool = Field(alias="passDestination")

    model_config = {"populate_by_name": True}


class StartSessionRequest(BaseModel):
    plate: str


class MarkCheckpointRequest(BaseModel):
    field: CheckpointSuffixEnum


class PlateLockResponse(BaseModel):
    holder_uid: UUID | None
    ref_date: str | None
    usage: int | None


class ClaimPlateLockRequest(BaseModel):
    plate: str
    ref_date: str
    usage: int


class UsageCountResponse(BaseModel):
    count: int


class UsageDateResponse(BaseModel):
    date: str | None


class HistoricalCountQuery(BaseModel):
    date: str


class RecordHistoricalSessionRequest(BaseModel):
    plate: str
    date: str
    count: int


class SessionCheckItem(BaseModel):
    field: CheckFieldEnum
    passed: bool
    note: str = ""
    fix: str = ""


class SessionSubmissionPayload(BaseModel):
    plate: str
    date: str
    count: int
    driver_name: str
    mile: str
    start_location: str = ""
    alcohol: bool = False
    drug: bool = False
    checks: list[SessionCheckItem]


class CheckpointPayload(BaseModel):
    time: str
    location: str | None = None


class WatchEvent(BaseModel):
    type: str
    uid: UUID
    field: str
    value: bool | str | None


WorkingSessionEnvelope.model_rebuild()
CheckpointEnvelope.model_rebuild()
