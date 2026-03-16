import pytest
from unittest.mock import AsyncMock, MagicMock
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.dependencies import get_current_user
from app.core.database import get_db_session

TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000"
TEST_USER = {
    "sub": TEST_USER_ID,
    "email": "test@example.com",
    "role": "authenticated",
    "aud": "authenticated",
}


def make_mock_db() -> AsyncMock:
    """Return a mock AsyncSession with sensible defaults for all common call patterns."""
    session = AsyncMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.flush = AsyncMock()
    session.add = MagicMock()

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_result.scalars.return_value.all.return_value = []
    mock_result.fetchall.return_value = []
    session.execute.return_value = mock_result
    return session


@pytest.fixture
def mock_db() -> AsyncMock:
    return make_mock_db()


@pytest.fixture
async def http_client(mock_db: AsyncMock):
    """AsyncClient with auth + DB dependencies overridden (no real DB or JWT needed)."""
    async def _override_db():
        yield mock_db

    app.dependency_overrides[get_current_user] = lambda: TEST_USER
    app.dependency_overrides[get_db_session] = _override_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
def sample_student():
    return {
        "name": "Test Student",
        "grade": "10",
        "background": "Interested in science",
        "interests": ["Physics", "Mathematics"],
    }


@pytest.fixture
def sample_chapter():
    return {
        "title": "Newton's Laws of Motion",
        "description": "Understanding the three fundamental laws of motion",
        "order_index": 1,
        "subject_name": "Physics",
    }

