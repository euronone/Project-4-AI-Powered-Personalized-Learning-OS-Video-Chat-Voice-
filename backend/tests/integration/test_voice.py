"""Integration tests for voice — session token creation.

Run with:
    supabase start
    pytest tests/integration/test_voice.py -m integration -v
"""
import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


# ---------------------------------------------------------------------------
# POST /api/voice/session
# ---------------------------------------------------------------------------


async def test_voice_session_requires_auth(integration_client: AsyncClient):
    resp = await integration_client.post("/api/voice/session")
    assert resp.status_code in (401, 403)


async def test_voice_session_returns_client_secret(
    integration_client: AsyncClient,
    auth_headers: dict,
    mock_openai_realtime,
):
    resp = await integration_client.post("/api/voice/session", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "client_secret" in body
    assert "session_id" in body
    assert body["client_secret"] == "ek_test_secret"


async def test_voice_session_response_shape(
    integration_client: AsyncClient,
    auth_headers: dict,
    mock_openai_realtime,
):
    resp = await integration_client.post("/api/voice/session", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert set(body.keys()) >= {"session_id", "client_secret", "model", "voice"}


async def test_voice_session_returns_502_when_openai_unreachable(
    integration_client: AsyncClient, auth_headers: dict
):
    """Without mock_openai_realtime, the call will fail → 502."""
    # OpenAI Realtime API is not available in test environment
    resp = await integration_client.post("/api/voice/session", headers=auth_headers)
    assert resp.status_code == 502
