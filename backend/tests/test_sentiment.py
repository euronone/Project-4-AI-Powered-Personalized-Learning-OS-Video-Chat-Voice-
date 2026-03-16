"""Tests for sentiment analyzer service and video router."""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient

from app.services.sentiment_analyzer import analyze_frame, determine_adaptive_action


# ---------------------------------------------------------------------------
# Service unit tests (these already pass — kept as is)
# ---------------------------------------------------------------------------

def test_adaptive_action_bored():
    action = determine_adaptive_action("bored", 0.8)
    assert action is not None
    assert "interactive" in action.lower() or "simplify" in action.lower()


def test_adaptive_action_low_confidence():
    action = determine_adaptive_action("bored", 0.3)
    assert action is None


def test_adaptive_action_engaged():
    action = determine_adaptive_action("engaged", 0.9)
    assert action is None


# ---------------------------------------------------------------------------
# analyze_frame service tests
# ---------------------------------------------------------------------------

async def test_analyze_frame_returns_valid_emotion():
    fake_response = MagicMock()
    fake_response.content = [MagicMock(text='{"emotion": "confused", "confidence": 0.75}')]

    with patch("app.services.sentiment_analyzer.claude_client") as mock_claude:
        mock_claude.messages.create = AsyncMock(return_value=fake_response)
        result = await analyze_frame("base64imagedata==")

    assert result["emotion"] == "confused"
    assert result["confidence"] == pytest.approx(0.75)


async def test_analyze_frame_clamps_invalid_emotion():
    fake_response = MagicMock()
    fake_response.content = [MagicMock(text='{"emotion": "angry", "confidence": 0.9}')]

    with patch("app.services.sentiment_analyzer.claude_client") as mock_claude:
        mock_claude.messages.create = AsyncMock(return_value=fake_response)
        result = await analyze_frame("base64imagedata==")

    assert result["emotion"] == "engaged"  # invalid → fallback to "engaged"


async def test_analyze_frame_clamps_confidence():
    fake_response = MagicMock()
    fake_response.content = [MagicMock(text='{"emotion": "happy", "confidence": 1.5}')]

    with patch("app.services.sentiment_analyzer.claude_client") as mock_claude:
        mock_claude.messages.create = AsyncMock(return_value=fake_response)
        result = await analyze_frame("base64imagedata==")

    assert result["confidence"] == pytest.approx(1.0)


# ---------------------------------------------------------------------------
# Video router tests
# ---------------------------------------------------------------------------

async def test_analyze_endpoint_returns_sentiment(http_client: AsyncClient, mock_db):
    fake_result = {"emotion": "bored", "confidence": 0.82}

    with patch("app.routers.video.analyze_frame", new=AsyncMock(return_value=fake_result)):
        with patch("app.routers.video.redis_client") as mock_redis:
            mock_redis.setex = AsyncMock()
            resp = await http_client.post(
                "/api/video/analyze",
                json={"chapter_id": str(uuid.uuid4()), "frame_base64": "abc123"},
            )

    assert resp.status_code == 200
    body = resp.json()
    assert body["emotion"] == "bored"
    assert body["confidence"] == pytest.approx(0.82)
    assert body["action_taken"] is not None  # bored @ 0.82 → action


async def test_analyze_endpoint_returns_502_on_claude_failure(
    http_client: AsyncClient, mock_db
):
    with patch("app.routers.video.analyze_frame", side_effect=RuntimeError("Claude down")):
        resp = await http_client.post(
            "/api/video/analyze",
            json={"chapter_id": str(uuid.uuid4()), "frame_base64": "abc123"},
        )

    assert resp.status_code == 502


async def test_analyze_endpoint_requires_auth():
    from httpx import ASGITransport, AsyncClient
    from app.main import app

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/video/analyze",
            json={"chapter_id": str(uuid.uuid4()), "frame_base64": "abc123"},
        )
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Progress router tests
# ---------------------------------------------------------------------------

async def test_get_progress_returns_subjects(http_client: AsyncClient, mock_db):
    from tests.conftest import TEST_USER_ID
    from app.models.progress import StudentProgress
    from app.models.subject import Subject

    subject_id = uuid.uuid4()

    fake_subject = MagicMock(spec=Subject)
    fake_subject.id = subject_id
    fake_subject.name = "Mathematics"

    fake_progress = MagicMock(spec=StudentProgress)
    fake_progress.subject_id = subject_id
    fake_progress.chapters_completed = 3
    fake_progress.total_chapters = 10
    fake_progress.average_score = 85.0
    fake_progress.strengths = ["algebra"]
    fake_progress.weaknesses = ["geometry"]

    subjects_result = MagicMock()
    subjects_result.scalars.return_value.all.return_value = [fake_subject]
    progress_result = MagicMock()
    progress_result.scalars.return_value.all.return_value = [fake_progress]

    mock_db.execute.side_effect = [subjects_result, progress_result]

    resp = await http_client.get(f"/api/progress/{TEST_USER_ID}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["student_id"] == TEST_USER_ID
    assert len(body["subjects"]) == 1
    assert body["subjects"][0]["subject_name"] == "Mathematics"
    assert body["subjects"][0]["chapters_completed"] == 3


async def test_get_progress_returns_403_for_other_student(http_client: AsyncClient):
    other_id = str(uuid.uuid4())
    resp = await http_client.get(f"/api/progress/{other_id}")
    assert resp.status_code == 403


async def test_get_progress_requires_auth():
    from httpx import ASGITransport, AsyncClient
    from app.main import app

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        from tests.conftest import TEST_USER_ID
        resp = await client.get(f"/api/progress/{TEST_USER_ID}")
    assert resp.status_code == 401
