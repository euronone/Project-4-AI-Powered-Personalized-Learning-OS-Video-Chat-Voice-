"""Integration tests for auth, onboarding, curriculum, and lessons.

Run with:
    supabase start
    pytest tests/integration/ -m integration -v
"""
import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


async def test_verify_returns_user_info(
    integration_client: AsyncClient, auth_headers: dict
):
    resp = await integration_client.post("/api/auth/verify", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "user_id" in data
    assert "onboarding_completed" in data


async def test_verify_rejects_missing_auth(integration_client: AsyncClient):
    resp = await integration_client.post("/api/auth/verify")
    assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Onboarding
# ---------------------------------------------------------------------------


async def test_onboarding_creates_student_and_subjects(
    integration_client: AsyncClient, auth_headers: dict
):
    payload = {
        "name": "Integration Student",
        "grade": "10",
        "background": "Science enthusiast",
        "interests": ["Physics"],
    }
    resp = await integration_client.post(
        "/api/onboarding", json=payload, headers=auth_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["onboarding_completed"] is True
    assert isinstance(data["subjects_created"], list)


async def test_onboarding_preserves_existing_on_retry(
    integration_client: AsyncClient, auth_headers: dict
):
    """Second onboarding call must not duplicate subjects."""
    payload = {
        "name": "Integration Student",
        "grade": "10",
        "background": "Science enthusiast",
        "interests": ["Physics"],
    }
    await integration_client.post("/api/onboarding", json=payload, headers=auth_headers)
    resp2 = await integration_client.post(
        "/api/onboarding", json=payload, headers=auth_headers
    )
    assert resp2.status_code == 200
    # Physics already exists so subjects_created should be empty
    assert resp2.json()["subjects_created"] == []


async def test_marksheet_upload_rejects_large_file(
    integration_client: AsyncClient, auth_headers: dict
):
    big = b"x" * (11 * 1024 * 1024)
    resp = await integration_client.post(
        "/api/onboarding/marksheet",
        files={"file": ("big.jpg", big, "image/jpeg")},
        headers=auth_headers,
    )
    assert resp.status_code == 413


# ---------------------------------------------------------------------------
# Curriculum
# ---------------------------------------------------------------------------


async def test_generate_curriculum_creates_chapters(
    integration_client: AsyncClient, auth_headers: dict, mock_claude
):
    """Requires Claude to be mocked or a real API key to be set."""
    resp = await integration_client.post(
        "/api/curriculum/generate",
        json={"subject_name": "Physics", "grade": "10"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert len(resp.json()["chapters"]) > 0


async def test_get_curriculum_requires_ownership(
    integration_client: AsyncClient, auth_headers: dict
):
    import uuid
    resp = await integration_client.get(
        f"/api/curriculum/{uuid.uuid4()}", headers=auth_headers
    )
    assert resp.status_code in (403, 404)


# ---------------------------------------------------------------------------
# Lessons
# ---------------------------------------------------------------------------


async def test_get_lesson_content_generates_lazily(
    integration_client: AsyncClient, auth_headers: dict
):
    """Requires an existing chapter_id in the DB and Claude mocked."""
    # This test requires setup of a chapter ID from a prior curriculum generate call.
    # Skipped until full E2E setup is available.
    pytest.skip("Requires pre-existing chapter and mocked Claude")


async def test_chat_returns_sse_stream(
    integration_client: AsyncClient, auth_headers: dict
):
    pytest.skip("Requires pre-existing chapter and mocked Claude")
