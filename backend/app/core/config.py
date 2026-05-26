"""
app/core/config.py
Centralised settings loaded from .env via pydantic-settings.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "MedAssist"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Google OAuth
    GOOGLE_CLIENT_ID: str = "834417550803-mcstcq4fns1o0glch0kut6l6ol4sjlck.apps.googleusercontent.com"

    # Groq AI
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # File Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 20

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    FRONTEND_URLS: str = "http://localhost:5173,http://127.0.0.1:5173,https://med-assist-v2.vercel.app"

    @property
    def allowed_origins(self) -> List[str]:
        return self.FRONTEND_URLS.split(",")

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
