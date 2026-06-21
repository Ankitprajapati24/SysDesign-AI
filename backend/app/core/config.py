from pydantic_settings import BaseSettings, SettingsConfigDict
<<<<<<< HEAD
from pydantic import field_validator
=======
>>>>>>> origin/feat/admin
from typing import Optional
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )
    
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    FRONTEND_URL: str = "http://localhost:5173"

<<<<<<< HEAD
    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v or "host/dbname" in v:
            backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            db_path = os.path.join(backend_dir, "designdoc.db")
            # Convert Windows path backslash to forward slash for standard URL syntax
            db_path = db_path.replace("\\", "/")
            return f"sqlite:///{db_path}"
        return v

settings = Settings()

=======
settings = Settings()
>>>>>>> origin/feat/admin
