from __future__ import annotations

from datetime import datetime, timezone

from tortoise import Tortoise
from tortoise.connection import get_connection
from tortoise.migrations.executor import MigrationExecutor, MigrationTarget
from tortoise.migrations.loader import MigrationLoader
from tortoise.migrations.recorder import MigrationRecorder

from core.db import TORTOISE_ORM


class MySQLCompatibleMigrationRecorder(MigrationRecorder):
    async def record_applied(self, app: str, name: str) -> None:
        # MySQL DATETIME rejects the timezone-qualified ISO string that the
        # upstream recorder emits, so store a plain UTC timestamp instead.
        if self._dialect == "mysql":
            applied_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f")
        else:
            applied_at = datetime.now(timezone.utc).isoformat()

        query = (
            f"INSERT INTO {self._quote(self.table_name)} "
            f"({self._quote('app')}, {self._quote('name')}, {self._quote('applied_at')}) "
            f"VALUES ('{self._escape(app)}', '{self._escape(name)}', '{applied_at}')"
        )
        await self.connection.execute_script(query)


class MigrationExecutorWithPatchedRecorder(MigrationExecutor):
    def __init__(self, connection, apps_config: dict[str, dict]) -> None:
        super().__init__(connection, apps_config)
        self.recorder = MySQLCompatibleMigrationRecorder(connection)
        self.loader = MigrationLoader(apps_config, self.recorder, load=False)


async def migrate_latest(*, fake: bool = False) -> None:
    await Tortoise.init(config=TORTOISE_ORM, init_connections=False)
    try:
        apps_by_connection: dict[str, dict[str, dict]] = {}
        for label, app_config in TORTOISE_ORM["apps"].items():
            connection_name = app_config.get("default_connection", "default")
            apps_by_connection.setdefault(connection_name, {})[label] = app_config

        for connection_name, apps_config in apps_by_connection.items():
            executor = MigrationExecutorWithPatchedRecorder(
                get_connection(connection_name), apps_config
            )
            targets = [
                MigrationTarget(app_label=label, name="__latest__") for label in apps_config
            ]
            await executor.migrate(targets, fake=fake)
    finally:
        await Tortoise.close_connections()
