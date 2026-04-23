from quart import Quart
from quart_schema import Info, QuartSchema
from tortoise import Tortoise

from core.config import settings
from core.db import TORTOISE_ORM
from routes import all_blueprints


def create_app() -> Quart:
    app = Quart(__name__)
    app.config["JSON_SORT_KEYS"] = False

    QuartSchema(
        app,
        info=Info(title="AppDev Driving API", version="0.1.0"),
        security_schemes={
            "bearer": {"type": "http", "scheme": "bearer", "bearer_format": "JWT"},
        },
        security=[{"bearer": []}],
        convert_casing=False,
    )

    for bp in all_blueprints:
        app.register_blueprint(bp)

    @app.before_serving
    async def _startup() -> None:
        await Tortoise.init(config=TORTOISE_ORM, _enable_global_fallback=True)

    @app.after_serving
    async def _shutdown() -> None:
        await Tortoise.close_connections()

    @app.after_request
    async def _cors(response):
        response.headers["Access-Control-Allow-Origin"] = settings.cors_origin
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
