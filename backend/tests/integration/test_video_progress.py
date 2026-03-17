"""Integration tests for video sentiment analysis and student progress.

Run with:
    supabase start
    pytest tests/integration/test_video_progress.py -m integration -v
"""
import base64
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration

# Minimal 1x1 white JPEG encoded in base64 for frame tests
_TINY_JPEG_B64 = (
    "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U"
    "HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN"
    "DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy"
    "MjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAA"
    "AAAAAAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAA"
    "AAAA/9oADAMBAAIRAxEAPwCwABmX/9k="
)


# ---------------------------------------------------------------------------
# POST /api/video/analyze
# ---------------------------------------------------------------------------


async def test_analyze_requires_auth(integration_client: AsyncClient):
    resp = await integration_client.post(
        "/api/video/analyze",
        json={"chapter_id": str(uuid.uuid4()), "frame_base64": _TINY_JPEG_B64},
    )
    assert resp.status_code in (401, 403)


async def test_analyze_returns_sentiment(
    integration_client: AsyncClient, auth_headers: dict
):
    """Mocks Claude Vision to return a canned sentiment response."""
    fake_result = {"emotion": "engaged", "confidence": 0.9}
    with patch(
        "app.routers.video.analyze_frame", new=AsyncMock(return_value=fake_result)
    ):
        with patch("app.routers.video.redis_client") as mock_redis:
            mock_redis.setex = AsyncMock()
            resp = await integration_client.post(
                "/api/video/analyze",
                json={
                    "chapter_id": str(uuid.uuid4()),
                    "frame_base64": _TINY_JPEG_B64,
                },
                headers=auth_headers,
            )

    assert resp.status_code == 200
    body = resp.json()
    assert body["emotion"] == "engaged"
    assert 0.0 <= body["confidence"] <= 1.0


async def test_analyze_returns_adaptive_action_for_bored(
    integration_client: AsyncClient, auth_headers: dict
):
    fake_result = {"emotion": "bored", "confidence": 0.75}
    with patch(
        "app.routers.video.analyze_frame", new=AsyncMock(return_value=fake_result)
    ):
        with patch("app.routers.video.redis_client") as mock_redis:
            mock_redis.setex = AsyncMock()
            resp = await integration_client.post(
                "/api/video/analyze",
                json={
                    "chapter_id": str(uuid.uuid4()),
                    "frame_base64": _TINY_JPEG_B64,
                },
                headers=auth_headers,
            )

    assert resp.status_code == 200
    assert resp.json()["action_taken"] is not None


async def test_analyze_returns_502_on_claude_failure(
    integration_client: AsyncClient, auth_headers: dict
):
    with patch(
        "app.routers.video.analyze_frame",
        side_effect=RuntimeError("Claude unreachable"),
    ):
        resp = await integration_client.post(
            "/api/video/analyze",
            json={
                "chapter_id": str(uuid.uuid4()),
                "frame_base64": _TINY_JPEG_B64,
            },
            headers=auth_headers,
        )
    assert resp.status_code == 502


async def test_analyze_persists_sentiment_log(
    integration_client: AsyncClient, auth_headers: dict
):
    """Verifies the endpoint writes a SentimentLog row to the DB.
    Requires real DB — skipped until supabase start + alembic upgrade head."""
    pytest.skip("Requires DB — run after supabase start and alembic upgrade head")


# ---------------------------------------------------------------------------
# GET /api/progress/{student_id}
# ---------------------------------------------------------------------------


async def test_progress_requires_auth(integration_client: AsyncClient):
    from tests.integration.conftest import TEST_USER_ID
    resp = await integration_client.get(f"/api/progress/{TEST_USER_ID}")
    assert resp.status_code in (401, 403)


async def test_progress_returns_403_for_other_user(
    integration_client: AsyncClient, auth_headers: dict
):
    other_id = str(uuid.uuid4())
    resp = await integration_client.get(
        f"/api/progress/{other_id}", headers=auth_headers
    )
    assert resp.status_code == 403


async def test_progress_returns_own_data(
    integration_client: AsyncClient, auth_headers: dict
):
    """Returns 200 with correct student_id (even if subjects list is empty)."""
    from tests.integration.conftest import TEST_USER_ID
    resp = await integration_client.get(
        f"/api/progress/{TEST_USER_ID}", headers=auth_headers
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["student_id"] == TEST_USER_ID
    assert isinstance(body["subjects"], list)
