import asyncio

import click
from tortoise import Tortoise

from core.db import TORTOISE_ORM
from core.migrations import migrate_latest
from core.security import hash_password
from models import Plate, User


async def _init_db() -> None:
    await Tortoise.init(config=TORTOISE_ORM)


async def _close_db() -> None:
    await Tortoise.close_connections()


def _run(coro):
    asyncio.run(coro)


@click.group()
def cli() -> None:
    """Management CLI — Django-style helpers for the Quart backend."""


@cli.command("create-user")
@click.option("--email", required=True)
@click.option("--password", prompt=True, hide_input=True, confirmation_prompt=True)
@click.option("--admin", is_flag=True, default=False, help="Grant admin privileges.")
def create_user(email: str, password: str, admin: bool) -> None:
    async def _run_inner() -> None:
        await _init_db()
        try:
            existing = await User.get_or_none(email=email)
            if existing is not None:
                click.echo(f"user already exists: {existing.id}")
                return
            user = await User.create(
                email=email, password_hash=hash_password(password), is_admin=admin
            )
            click.echo(f"created user {user.id} ({user.email}, admin={user.is_admin})")
        finally:
            await _close_db()

    _run(_run_inner())


@cli.command("reset-db")
@click.confirmation_option(prompt="Drop all application tables?")
def reset_db() -> None:
    async def _run_inner() -> None:
        await _init_db()
        try:
            await Tortoise.generate_schemas(safe=False)
            click.echo("schemas regenerated")
        finally:
            await _close_db()

    _run(_run_inner())


@cli.command("migrate")
@click.option("--fake", is_flag=True, default=False, help="Record migrations without executing SQL.")
def migrate(fake: bool) -> None:
    _run(migrate_latest(fake=fake))


@cli.command("seed")
def seed() -> None:
    async def _run_inner() -> None:
        await _init_db()
        try:
            demo_email = "admin@example.com"
            admin = await User.get_or_none(email=demo_email)
            if admin is None:
                admin = await User.create(
                    email=demo_email,
                    password_hash=hash_password("admin1234"),
                    is_admin=True,
                )
                click.echo(f"created admin {admin.id} ({demo_email} / admin1234)")
            else:
                click.echo(f"admin already exists: {admin.id}")

            demo_plates = ["1กก-1111", "2ขข-2222", "3คค-3333"]
            created = 0
            for code in demo_plates:
                _, was_created = await Plate.get_or_create(code=code)
                if was_created:
                    created += 1
            click.echo(f"plates: +{created} new, {len(demo_plates) - created} existing")
        finally:
            await _close_db()

    _run(_run_inner())


if __name__ == "__main__":
    cli()
