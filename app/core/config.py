from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from pydantic import computed_field

class Settings(BaseSettings):
    DATABASE_URL: str
    APP_ENV: str
    SECRET_KEY: str
    ACCESS_TOKEN_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Email settings
    SENDGRID_API_KEY: str | None = None
    MAIL_FROM: str | None = None
    MAIL_FROM_NAME: str | None = "Idea Manager"
    EXTERNAL_BASE_URL: str | None = "http://localhost:8000"
    FRONTEND_BASE_URL: str | None = "http://localhost:5173"
    EMAIL_ENABLED: bool | None = False

    ENABLE_DOCS: bool = True                # set False in .env.prod to hide /docs
    ALLOWED_HOSTS: str = ""                 # comma list, e.g. "api.eddyb.dev"

    # scoring weights
    SCORE_W_SCALABILITY: float = 0.35
    SCORE_W_EASE: float = 0.25
    SCORE_W_AI_FLAG: float = 0.10
    SCORE_W_AI_COMPLEX: float = 0.30

    # CORS - Store as string and convert to list
    BACKEND_CORS_ORIGINS: str = ""

    COOKIE_SESSION_NAME: str = "im_access"
    COOKIE_SECURE: bool = False            # True in prod (set via .env)
    COOKIE_SAMESITE: str = "lax"           # "strict" or "lax"; use "strict" if FE/BE same site
    COOKIE_MAX_AGE_SECONDS: int = 60 * 60  # 1 hour; match ACCESS_TOKEN_EXPIRE_MINUTES

    @computed_field
    @property
    def cors_origins(self) -> List[str]:
        """Convert comma-separated CORS origins to list"""
        if not self.BACKEND_CORS_ORIGINS:
            return []
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(',') if origin.strip()]
    
    @computed_field
    @property
    def allowed_hosts_list(self) -> List[str]:
        if not self.ALLOWED_HOSTS:
            return []
        return [h.strip() for h in self.ALLOWED_HOSTS.split(",") if h.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )   

settings = Settings()