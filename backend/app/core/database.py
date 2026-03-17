from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
# from app.config import settings
from app.core.config import settings

# engine = create_async_engine(settings.supabase_db_url, echo=False)
engine = create_async_engine(settings.SUPABASE_DB_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db_session():
    async with async_session() as session:
        yield session
