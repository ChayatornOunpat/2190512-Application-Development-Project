from __future__ import annotations

from typing import TYPE_CHECKING

from tortoise import fields
from tortoise.models import Model

if TYPE_CHECKING:
    from .user import User


class Plate(Model):
    code = fields.CharField(pk=True, max_length=32)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "plate"


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
