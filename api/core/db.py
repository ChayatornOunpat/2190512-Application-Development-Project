from core.config import settings


TORTOISE_ORM = {
    "connections": {"default": settings.database_url},
    "apps": {
        "models": {
            "models": ["models"],
            "migrations": "models.migrations",
            "default_connection": "default",
        },
    },
    "use_tz": False,
    "timezone": "Asia/Bangkok",
}
