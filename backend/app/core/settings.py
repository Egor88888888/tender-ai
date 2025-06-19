"""Application settings using Pydantic BaseSettings.
This centralises environment variables for local and Azure deployments.
"""
from functools import lru_cache
from typing import Literal

from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    # General
    env: Literal["local", "azure"] = Field("local", env="APP_ENV")

    # Database
    postgres_user: str = Field("postgres", env="POSTGRES_USER")
    postgres_password: str = Field("postgres", env="POSTGRES_PASSWORD")
    postgres_db: str = Field("tender_ai", env="POSTGRES_DB")
    postgres_host: str = Field("db", env="POSTGRES_HOST")
    postgres_port: int = Field(5432, env="POSTGRES_PORT")

    # Redis
    redis_url: str = Field("redis://redis:6379/0", env="REDIS_URL")

    # Azure Blob / MinIO
    storage_connection_string: str | None = Field(
        default=None, env="AZURE_STORAGE_CONNECTION_STRING")
    storage_container: str = Field(
        "tender-docs", env="AZURE_STORAGE_CONTAINER")

    # Gemini
    gemini_api_key: str = Field(..., env="GEMINI_API_KEY")

    class Config:
        case_sensitive = False
        env_file = "../.env"


@lru_cache
def get_settings() -> Settings:  # noqa: D401
    """Return cached Settings instance."""
    return Settings()
