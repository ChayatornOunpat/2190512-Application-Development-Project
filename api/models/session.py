from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from tortoise import fields
from tortoise.models import Model

from .enums import CheckFieldEnum, CheckpointSuffixEnum

if TYPE_CHECKING:
    from .plate import Plate
    from .user import User


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
