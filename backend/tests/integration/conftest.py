"""
Integration test fixtures.

Requires Supabase local dev to be running:
    supabase start

The TEST_DB_URL in .env points to localhost:54322 (local Supabase Postgres).
Mark all integration tests with @pytest.mark.integration so they can be
run separately:
    pytest tests/integration/ -m integration -v
"""
import json
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient, ASGITransport
from jose import jwt

from app.main import app
from app.config import settings

# Use the local Supabase JWT secret (from `supabase status`)
TEST_JWT_SECRET = (
    settings.supabase_jwt_secret
    or "super-secret-jwt-token-with-at-least-32-characters-long"
)
TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000"

pytestmark = pytest.mark.integration


def make_test_jwt(user_id: str = TEST_USER_ID) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": "integration@test.com",
        "role": "authenticated",
        "aud": "authenticated",
        "exp": now + timedelta(hours=1),
        "iat": now,
    }
    return jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")


@pytest.fixture
def auth_headers() -> dict:
    return {"Authorization": f"Bearer {make_test_jwt()}"}


@pytest.fixture
async def integration_client() -> AsyncClient:
    """Real HTTP client hitting the real app (real DB via TEST_DB_URL)."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest.fixture
def mock_claude():
    """Patch the Claude client for integration tests that don't need real AI."""

    def _make_curriculum_response():
        body = {
            "chapters": [
                {
                    "order_index": 1,
                    "title": "Introduction",
                    "description": "Basics",
                    "learning_objectives": ["Understand fundamentals"],
                    "estimated_difficulty": "beginner",
                }
            ]
        }
        msg = MagicMock()
        msg.content = [MagicMock(text=json.dumps(body))]
        return msg

    def _make_content_response():
        body = {
            "text": "Chapter text here.",
            "key_concepts": ["concept A"],
            "examples": ["example 1"],
            "diagrams": [],
            "formulas": [],
            "summary": "Summary.",
        }
        msg = MagicMock()
        msg.content = [MagicMock(text=json.dumps(body))]
        return msg

    def _make_eval_response():
        body = {
            "score": 80,
            "feedback": "Good work.",
            "guidance": "Review concept A.",
            "correct_answer": "42",
        }
        msg = MagicMock()
        msg.content = [MagicMock(text=json.dumps(body))]
        return msg

    def _make_activities_response():
        body = {
            "activities": [
                {
                    "type": "quiz",
                    "prompt": {"question": "What is concept A?", "options": ["A", "B", "C", "D"]},
                }
            ]
        }
        msg = MagicMock()
        msg.content = [MagicMock(text=json.dumps(body))]
        return msg

    def _make_sentiment_response():
        body = {"emotion": "engaged", "confidence": 0.85}
        msg = MagicMock()
        msg.content = [MagicMock(text=json.dumps(body))]
        return msg

    mock = AsyncMock(
        side_effect=[
            _make_curriculum_response(),
            _make_content_response(),
            _make_eval_response(),
            _make_activities_response(),
            _make_sentiment_response(),
        ]
        * 10  # enough for any test
    )

    with patch("app.core.ai_client.claude_client") as patched:
        patched.messages.create = mock
        # streaming context manager for teaching chat
        stream_ctx = MagicMock()
        stream_ctx.__aenter__ = AsyncMock(return_value=stream_ctx)
        stream_ctx.__aexit__ = AsyncMock(return_value=False)
        stream_ctx.text_stream = (chunk for chunk in ["Hello ", "student!"])
        patched.messages.stream = MagicMock(return_value=stream_ctx)
        yield patched


@pytest.fixture
def mock_openai_realtime():
    """Patch httpx calls to OpenAI Realtime API."""
    fake_session = {
        "id": "sess_test123",
        "model": settings.openai_realtime_model,
        "voice": "alloy",
        "client_secret": {"value": "ek_test_secret"},
    }

    async def _fake_post(self, url, *, headers, json, timeout):
        response = MagicMock()
        response.status_code = 200
        response.json.return_value = fake_session
        response.raise_for_status = MagicMock()
        return response

    with patch("httpx.AsyncClient.post", new=_fake_post):
        yield fake_session
