"""Unit tests for voice_manager service and /api/voice/session route."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient

# ---------------------------------------------------------------------------
# Service unit tests
# ---------------------------------------------------------------------------

_OPENAI_SESSION_RESPONSE = {
    "id": "sess_abc123",
    "model": "gpt-4o-realtime-preview",
    "voice": "alloy",
    "client_secret": {"value": "ek_secret_tok_xyz", "expires_at": 9999999999},
}


async def test_create_realtime_session_sends_correct_model():
    from app.services.voice_manager import create_realtime_session

    mock_resp = MagicMock()
    mock_resp.json.return_value = _OPENAI_SESSION_RESPONSE
    mock_resp.raise_for_status = MagicMock()

    with patch("app.services.voice_manager.settings") as s, patch(
        "httpx.AsyncClient.post", new=AsyncMock(return_value=mock_resp)
    ):
        s.openai_api_key = "test-key"
        s.openai_realtime_model = "gpt-4o-realtime-preview"
        result = await create_realtime_session()

    assert result["id"] == "sess_abc123"


async def test_create_realtime_session_includes_vad():
    """Request body must include server_vad turn detection."""
    from app.services.voice_manager import create_realtime_session

    captured_body: dict = {}

    async def _fake_post(self, url, *, headers, json, timeout):
        captured_body.update(json)
        mock_resp = MagicMock()
        mock_resp.json.return_value = _OPENAI_SESSION_RESPONSE
        mock_resp.raise_for_status = MagicMock()
        return mock_resp

    with patch("app.services.voice_manager.settings") as s, patch(
        "httpx.AsyncClient.post", new=_fake_post
    ):
        s.openai_api_key = "test-key"
        s.openai_realtime_model = "gpt-4o-realtime-preview"
        await create_realtime_session()

    assert captured_body.get("turn_detection", {}).get("type") == "server_vad"


# ---------------------------------------------------------------------------
# Router tests
# ---------------------------------------------------------------------------


async def test_voice_session_returns_client_secret(http_client: AsyncClient):
    with patch(
        "app.routers.voice.create_realtime_session",
        new=AsyncMock(return_value=_OPENAI_SESSION_RESPONSE),
    ):
        resp = await http_client.post("/api/voice/session")

    assert resp.status_code == 200
    data = resp.json()
    assert data["session_id"] == "sess_abc123"
    assert data["client_secret"] == "ek_secret_tok_xyz"
    assert data["model"] == "gpt-4o-realtime-preview"
    assert data["voice"] == "alloy"


async def test_voice_session_requires_auth():
    from app.main import app
    from httpx import AsyncClient, ASGITransport

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        resp = await ac.post("/api/voice/session")
    assert resp.status_code in (401, 403)


async def test_voice_session_returns_502_on_openai_failure(http_client: AsyncClient):
    with patch(
        "app.routers.voice.create_realtime_session",
        new=AsyncMock(side_effect=Exception("OpenAI unreachable")),
    ):
        resp = await http_client.post("/api/voice/session")
    assert resp.status_code == 502

