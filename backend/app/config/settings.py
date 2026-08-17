from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    environment: str = "development"
    port: int = 8000
    frontend_url: str = "http://localhost:8081"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
