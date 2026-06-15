from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "AI Career Adviser"
    debug: bool = False
    api_prefix: str = "/api"

    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    groq_max_retries: int = 3

    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    upload_dir: Path = Path(__file__).resolve().parents[2] / "uploads"
    models_dir: Path = Path(__file__).resolve().parents[2] / "models"
    max_upload_size_mb: int = 10

    allowed_extensions: set[str] = {".pdf", ".docx"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
