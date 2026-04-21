import uuid
from enum import Enum

from tortoise import fields
from tortoise.models import Model


class CheckFieldEnum(str, Enum):
    law = "law"
    tax = "tax"
    insurance = "insurance"
    passport = "passport"
    headlight = "headlight"
    turnlight = "turnlight"
    toplight = "toplight"
    lubeoil = "lubeoil"
    tankcoolant = "tankcoolant"
    percipitation = "percipitation"
    opsname = "opsname"
    doormirror = "doormirror"
    tire = "tire"
    tirehub = "tirehub"
    tirehub2 = "tirehub2"
    tirehub3 = "tirehub3"
    tirehub4 = "tirehub4"
    spare = "spare"
    pressure = "pressure"
    extinguisher = "extinguisher"
    tiresupport = "tiresupport"
    cone = "cone"
    breaklight = "breaklight"
    reverselight = "reverselight"
    backturnlight = "backturnlight"
    structuralintegrity = "structuralintegrity"
    fastener = "fastener"
    cover = "cover"


class CheckpointSuffixEnum(str, Enum):
    rest1 = "rest1"
    rest2 = "rest2"
    destination = "destination"
    passRest1 = "passRest1"
    passRest2 = "passRest2"
    passDestination = "passDestination"
    end = "end"


class User(Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    email = fields.CharField(max_length=254, unique=True)
    password_hash = fields.CharField(max_length=255)
    is_admin = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "user"


class Plate(Model):
    code = fields.CharField(pk=True, max_length=32)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "plate"


class WorkingSession(Model):
    user: fields.OneToOneRelation["User"] = fields.OneToOneField(
        "models.User", related_name="working_session", pk=True, on_delete=fields.CASCADE
    )
    plate = fields.CharField(max_length=32)
    working = fields.BooleanField(default=True)
    rest1 = fields.BooleanField(default=False)
    rest2 = fields.BooleanField(default=False)
    destination = fields.BooleanField(default=False)
    pass_rest1 = fields.BooleanField(default=False)
    pass_rest2 = fields.BooleanField(default=False)
    pass_destination = fields.BooleanField(default=False)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "working_session"


class PlateLock(Model):
    plate: fields.OneToOneRelation["Plate"] = fields.OneToOneField(
        "models.Plate", related_name="lock", pk=True, on_delete=fields.CASCADE
    )
    holder: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        "models.User", related_name="plate_locks", on_delete=fields.CASCADE
    )
    ref_date = fields.CharField(max_length=10)
    usage = fields.IntField(default=0)
    acquired_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "plate_lock"


class PlateDailyUsage(Model):
    id = fields.IntField(pk=True)
    plate: fields.ForeignKeyRelation["Plate"] = fields.ForeignKeyField(
        "models.Plate", related_name="daily_usage", on_delete=fields.CASCADE
    )
    date = fields.CharField(max_length=10)
    count = fields.IntField(default=0)

    class Meta:
        table = "plate_daily_usage"
        unique_together = (("plate", "date"),)


class SessionSubmission(Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    plate: fields.ForeignKeyRelation["Plate"] = fields.ForeignKeyField(
        "models.Plate", related_name="submissions", on_delete=fields.CASCADE
    )
    driver: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        "models.User", related_name="submissions", on_delete=fields.CASCADE
    )
    date = fields.CharField(max_length=10)
    count = fields.IntField()
    driver_name = fields.CharField(max_length=255)
    mile = fields.CharField(max_length=32)
    start_location = fields.CharField(max_length=512, default="")
    alcohol = fields.BooleanField(default=False)
    drug = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "session_submission"
        unique_together = (("plate", "date", "count"),)


class SessionCheck(Model):
    id = fields.IntField(pk=True)
    submission: fields.ForeignKeyRelation["SessionSubmission"] = fields.ForeignKeyField(
        "models.SessionSubmission", related_name="checks", on_delete=fields.CASCADE
    )
    field = fields.CharEnumField(CheckFieldEnum, max_length=32)
    passed = fields.BooleanField(default=False)
    note = fields.CharField(max_length=512, default="")
    fix = fields.CharField(max_length=512, default="")

    class Meta:
        table = "session_check"
        unique_together = (("submission", "field"),)


class SessionCheckpoint(Model):
    id = fields.IntField(pk=True)
    submission: fields.ForeignKeyRelation["SessionSubmission"] = fields.ForeignKeyField(
        "models.SessionSubmission", related_name="checkpoints", on_delete=fields.CASCADE
    )
    suffix = fields.CharEnumField(CheckpointSuffixEnum, max_length=20)
    time = fields.CharField(max_length=32)
    location = fields.CharField(max_length=512, null=True)

    class Meta:
        table = "session_checkpoint"
        unique_together = (("submission", "suffix"),)
