from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""
    supabase_db_url: str = ""

    # Redis
    redis_url: str = "redis://localhost:6379"

    # AI
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    llm_mode: str = "mock"
    llm_provider: str = "euron"
    euron_api_key: str | None = None
    euron_base_url: str = "https://api.euron.one/api/v1/euri"

    # Server
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: list[str] = ["http://localhost:3000"]

    # Sentiment
    sentiment_frame_interval_ms: int = 5000
    sentiment_confidence_threshold: float = 0.6

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
