from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str
    APP_ENV: str

    # scoring weights
    SCORE_W_SCALABILITY: float = 0.35
    SCORE_W_EASE: float = 0.25
    SCORE_W_AI_FLAG: float = 0.10
    SCORE_W_AI_COMPLEX: float = 0.30

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )   

settings = Settings()