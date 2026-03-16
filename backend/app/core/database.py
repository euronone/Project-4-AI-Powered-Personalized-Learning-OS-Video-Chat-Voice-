from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

class Base(DeclarativeBase):
    pass


# Lazy initialisation — engine is only created on first DB use.
# This prevents import-time failures when SUPABASE_DB_URL is not set (e.g. unit tests
# that override get_db_session via dependency injection).
_engine = None
_session_factory = None


def _get_engine():
    global _engine
    if _engine is None:
        db_url = settings.supabase_db_url or settings.test_db_url or "sqlite+aiosqlite:///./learnos_dev.db"
        _engine = create_async_engine(db_url, echo=False)
    return _engine


def _get_session_factory():
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            _get_engine(), class_=AsyncSession, expire_on_commit=False
        )
    return _session_factory


def create_session() -> AsyncSession:
    """Create a standalone async session for use outside the request lifecycle."""
    return _get_session_factory()()


async def get_db_session():
    async with _get_session_factory()() as session:
        yield session
