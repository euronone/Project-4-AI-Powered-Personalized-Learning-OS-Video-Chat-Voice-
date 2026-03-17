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

    # AI — API keys
    anthropic_api_key: str = ""
    openai_api_key: str = ""

    # AI — Model selection (change here to swap models globally)
    claude_model: str = "claude-3-5-sonnet-20241022"
    claude_vision_model: str = "claude-3-5-sonnet-20241022"
    openai_realtime_model: str = "gpt-4o-realtime-preview"

    # Server
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: list[str] = ["http://localhost:3000"]

    # Sentiment
    sentiment_frame_interval_ms: int = 5000
    sentiment_confidence_threshold: float = 0.6

    # Uploads
    max_upload_size_mb: int = 10
    allowed_upload_extensions: list[str] = ["image/jpeg", "image/png", "application/pdf"]

    # Test DB (Supabase local dev — run: supabase start)
    test_db_url: str = "postgresql+asyncpg://postgres:postgres@localhost:54322/postgres"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
