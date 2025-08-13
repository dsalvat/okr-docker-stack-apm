from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import json

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o-mini"
    CORS_ORIGINS: str = '["http://localhost:5173"]'  # JSON list
    REDIS_URL: str | None = None
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    RATE_LIMIT_MAX_REQUESTS: int = 60

    def cors_origins_list(self) -> List[str]:
        try:
            return json.loads(self.CORS_ORIGINS)
        except Exception:
            return ["http://localhost:5173"]

settings = Settings()
