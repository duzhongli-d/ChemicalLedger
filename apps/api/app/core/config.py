from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/qc_platform"
    SECRET_KEY: str = "changeme-in-production-use-strong-random-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # S3 / MinIO
    S3_ENDPOINT: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "qc-platform"

    # NotebookLM
    NOTEBOOKLM_API_KEY: str = ""
    NOTEBOOKLM_BASE_URL: str = "https://notebooklm.google.com/api/v1"

    # Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_BASE_URL: str = "https://generativelanguage.googleapis.com"

    # SendGrid
    SENDGRID_API_KEY: str = ""
    SENDGRID_FROM_EMAIL: str = "noreply@abachem.com"

    # Tesseract
    TESSERACT_CMD: str = "tesseract"

    # Daily quota
    DAILY_QUESTION_LIMIT: int = 10

    model_config = SettingsConfigDict(env_file=".env", extra="allow")


@lru_cache
def get_settings() -> Settings:
    return Settings()
