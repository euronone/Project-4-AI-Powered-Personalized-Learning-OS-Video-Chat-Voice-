"""Unit tests for the /api/auth/verify route."""
from unittest.mock import MagicMock

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from tests.conftest import TEST_USER_ID


async def test_verify_returns_user_data(http_client: AsyncClient):
    resp = await http_client.post("/api/auth/verify")
    assert resp.status_code == 200
    data = resp.json()
    assert data["user_id"] == TEST_USER_ID
    assert data["email"] == "test@example.com"
    # mock DB returns scalar_one_or_none() == None -> default False
    assert data["onboarding_completed"] is False


async def test_verify_returns_onboarding_true_when_student_exists(
    http_client: AsyncClient, mock_db
):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = True
    mock_db.execute.return_value = mock_result

    resp = await http_client.post("/api/auth/verify")
    assert resp.status_code == 200
    assert resp.json()["onboarding_completed"] is True


async def test_verify_requires_auth():
    """Request without Authorization header must be rejected."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        resp = await ac.post("/api/auth/verify")
    # FastAPI HTTPBearer raises 403 for missing header
    assert resp.status_code in (401, 403)
