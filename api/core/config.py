from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "mysql://appdev:appdevpw@localhost:3306/appdev"
    jwt_secret: str = "change-me-in-env"
    jwt_ttl_seconds: int = 60 * 60 * 24 * 7
    bcrypt_pepper: str = "change-me-in-env"
    templates_dir: str = "./templates"
    cors_origin: str = "*"


settings = Settings()