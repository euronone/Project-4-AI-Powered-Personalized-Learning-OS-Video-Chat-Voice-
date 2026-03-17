"""Integration tests for activities — submit, evaluate, list.

Run with:
    supabase start
    pytest tests/integration/test_activities.py -m integration -v
"""
import uuid

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


# ---------------------------------------------------------------------------
# GET /api/activities/{activity_id}
# ---------------------------------------------------------------------------


async def test_get_activity_returns_404_for_unknown(
    integration_client: AsyncClient, auth_headers: dict
):
    resp = await integration_client.get(
        f"/api/activities/{uuid.uuid4()}", headers=auth_headers
    )
    assert resp.status_code == 404


async def test_get_activity_requires_auth(integration_client: AsyncClient):
    resp = await integration_client.get(f"/api/activities/{uuid.uuid4()}")
    assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# POST /api/activities/{activity_id}/submit
# ---------------------------------------------------------------------------


async def test_submit_activity_returns_404_for_unknown(
    integration_client: AsyncClient, auth_headers: dict
):
    resp = await integration_client.post(
        f"/api/activities/{uuid.uuid4()}/submit",
        json={"response": {"answer": "A"}},
        headers=auth_headers,
    )
    assert resp.status_code == 404


async def test_submit_activity_requires_auth(integration_client: AsyncClient):
    resp = await integration_client.post(
        f"/api/activities/{uuid.uuid4()}/submit",
        json={"response": {"answer": "A"}},
    )
    assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# POST /api/activities/{activity_id}/evaluate
# ---------------------------------------------------------------------------


async def test_evaluate_activity_returns_404_for_unknown(
    integration_client: AsyncClient, auth_headers: dict, mock_claude
):
    resp = await integration_client.post(
        f"/api/activities/{uuid.uuid4()}/evaluate",
        headers=auth_headers,
    )
    assert resp.status_code == 404


async def test_evaluate_activity_requires_auth(integration_client: AsyncClient):
    resp = await integration_client.post(
        f"/api/activities/{uuid.uuid4()}/evaluate"
    )
    assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Full submit → evaluate flow (requires DB seed)
# ---------------------------------------------------------------------------


async def test_submit_then_evaluate_full_flow(
    integration_client: AsyncClient, auth_headers: dict, mock_claude
):
    """Full activity lifecycle: requires an existing chapter in DB.
    Skipped until DB seed is set up via supabase start + migrations."""
    pytest.skip("Requires DB seed — run after supabase start and alembic upgrade head")
