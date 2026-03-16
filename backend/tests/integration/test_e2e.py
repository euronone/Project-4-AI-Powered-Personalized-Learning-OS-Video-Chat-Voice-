"""End-to-end tests — complete student learning journeys.

These tests walk through full user scenarios from auth through to activity
evaluation, simulating the real product flows. AI calls (Claude, OpenAI) are
mocked so the tests run without live API keys but still exercise the full
request → DB → service → response stack.

Run with:
    supabase start
    alembic upgrade head
    pytest tests/integration/test_e2e.py -m integration -v

Tests that require a fully seeded DB are marked with pytest.skip and include
instructions to enable them.
"""
import json
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_CURRICULUM_JSON = {
    "chapters": [
        {
            "order_index": 1,
            "title": "Forces and Motion",
            "description": "Newton's laws and applications",
            "learning_objectives": ["Understand F=ma", "Apply Newton's laws"],
            "estimated_difficulty": "intermediate",
        },
        {
            "order_index": 2,
            "title": "Energy",
            "description": "Kinetic and potential energy",
            "learning_objectives": ["Define energy types"],
            "estimated_difficulty": "intermediate",
        },
    ]
}

_CONTENT_JSON = {
    "text": "Forces cause acceleration. F = ma where m is mass and a is acceleration.",
    "key_concepts": ["Force", "Mass", "Acceleration"],
    "examples": ["A car accelerating from rest"],
    "diagrams": [{"title": "Force diagram", "mermaid": "graph TD; A-->B"}],
    "formulas": [{"description": "Newton's second law", "latex": "F = ma"}],
    "summary": "Forces determine how objects accelerate.",
}

_ACTIVITIES_JSON = {
    "activities": [
        {
            "type": "quiz",
            "prompt": {
                "question": "What does F = ma represent?",
                "options": [
                    "Force equals mass times area",
                    "Force equals mass times acceleration",
                    "Frequency equals mass times amplitude",
                    "None of the above",
                ],
            },
        },
        {
            "type": "problem_set",
            "prompt": {
                "question": "A 5 kg block is pushed with 20 N. What is the acceleration?",
                "hint": "Use F = ma",
            },
        },
    ]
}

_EVAL_JSON = {
    "score": 90,
    "feedback": "Excellent! You correctly identified Newton's second law.",
    "guidance": "Try applying this to multi-body problems next.",
    "correct_answer": "Force equals mass times acceleration",
}


def _make_claude_response(body: dict) -> MagicMock:
    msg = MagicMock()
    msg.content = [MagicMock(text=json.dumps(body))]
    return msg


# ---------------------------------------------------------------------------
# Scenario 1: Auth → Onboarding → Curriculum generation
# ---------------------------------------------------------------------------


async def test_e2e_auth_and_onboard(
    integration_client: AsyncClient, auth_headers: dict
):
    """Student authenticates and completes onboarding."""
    # Verify JWT
    verify_resp = await integration_client.post(
        "/api/auth/verify", headers=auth_headers
    )
    assert verify_resp.status_code == 200
    assert "user_id" in verify_resp.json()

    # Complete onboarding
    with patch(
        "app.routers.onboarding.supabase_client", MagicMock()
    ):  # mock storage upload path
        onboard_resp = await integration_client.post(
            "/api/onboarding",
            json={
                "name": "E2E Student",
                "grade": "10",
                "background": "Interested in physics",
                "interests": ["Physics"],
                "learning_goals": "Understand mechanics",
            },
            headers=auth_headers,
        )

    assert onboard_resp.status_code == 200
    data = onboard_resp.json()
    assert data["onboarding_completed"] is True


async def test_e2e_onboarding_idempotency(
    integration_client: AsyncClient, auth_headers: dict
):
    """Calling onboarding a second time with same interests must not duplicate subjects."""
    payload = {
        "name": "E2E Student",
        "grade": "10",
        "background": "Physics fan",
        "interests": ["Physics"],
    }
    await integration_client.post("/api/onboarding", json=payload, headers=auth_headers)
    second_resp = await integration_client.post(
        "/api/onboarding", json=payload, headers=auth_headers
    )
    assert second_resp.status_code == 200
    assert second_resp.json()["subjects_created"] == []


# ---------------------------------------------------------------------------
# Scenario 2: Curriculum generation → view chapter content → chat
# ---------------------------------------------------------------------------


async def test_e2e_curriculum_generate_and_get(
    integration_client: AsyncClient, auth_headers: dict
):
    """Generate a curriculum then retrieve it. IDs are stable after first call."""
    with patch(
        "app.services.curriculum_generator.claude_client"
    ) as mock_cl:
        mock_cl.messages.create = AsyncMock(
            return_value=_make_claude_response(_CURRICULUM_JSON)
        )
        gen_resp = await integration_client.post(
            "/api/curriculum/generate",
            json={"subject_name": "Physics"},
            headers=auth_headers,
        )

    assert gen_resp.status_code == 200
    body = gen_resp.json()
    subject_id = body["subject_id"]
    assert len(body["chapters"]) == 2

    # Retrieve it — must return the same data without calling Claude again
    get_resp = await integration_client.get(
        f"/api/curriculum/{subject_id}", headers=auth_headers
    )
    assert get_resp.status_code == 200
    assert get_resp.json()["subject_id"] == subject_id


async def test_e2e_curriculum_wrong_owner_forbidden(
    integration_client: AsyncClient, auth_headers: dict
):
    """A different user's subject_id must return 403 or 404, never the data."""
    resp = await integration_client.get(
        f"/api/curriculum/{uuid.uuid4()}", headers=auth_headers
    )
    assert resp.status_code in (403, 404)


async def test_e2e_lesson_content_lazy_generation(
    integration_client: AsyncClient, auth_headers: dict
):
    """Content is generated once and cached — second call must NOT call Claude."""
    pytest.skip(
        "Requires a seeded chapter_id. Enable after supabase start + alembic upgrade head."
    )


async def test_e2e_lesson_chat_streams_response(
    integration_client: AsyncClient, auth_headers: dict
):
    """Chat endpoint returns SSE stream with tutor response chunks."""
    pytest.skip(
        "Requires a seeded chapter_id. Enable after supabase start + alembic upgrade head."
    )


# ---------------------------------------------------------------------------
# Scenario 3: Complete chapter → activities auto-generated → submit → evaluate
# ---------------------------------------------------------------------------


async def test_e2e_complete_chapter_triggers_activity_generation(
    integration_client: AsyncClient, auth_headers: dict
):
    """Marking a chapter complete must auto-generate activities."""
    pytest.skip(
        "Requires a seeded chapter_id with content_json. "
        "Enable after supabase start + alembic upgrade head."
    )


async def test_e2e_activity_submit_and_evaluate_full_flow(
    integration_client: AsyncClient, auth_headers: dict
):
    """Full activity lifecycle: list activities → submit response → evaluate.

    Steps:
    1. GET /api/lessons/{chapter_id}/activities  → get activity_id
    2. POST /api/activities/{activity_id}/submit  → 200
    3. POST /api/activities/{activity_id}/evaluate → score returned
    """
    pytest.skip(
        "Requires seeded chapter + activities. "
        "Enable after supabase start + alembic upgrade head."
    )


async def test_e2e_activity_duplicate_submission_rejected(
    integration_client: AsyncClient, auth_headers: dict
):
    """Submitting the same activity twice must return 409."""
    pytest.skip(
        "Requires seeded chapter + activities. "
        "Enable after supabase start + alembic upgrade head."
    )


async def test_e2e_evaluate_without_submission_rejected(
    integration_client: AsyncClient, auth_headers: dict
):
    """Evaluating before submitting must return 422."""
    pytest.skip(
        "Requires seeded chapter + activities. "
        "Enable after supabase start + alembic upgrade head."
    )


# ---------------------------------------------------------------------------
# Scenario 4: Video sentiment → progress reflects completed work
# ---------------------------------------------------------------------------


async def test_e2e_sentiment_analysis_persisted_to_db(
    integration_client: AsyncClient, auth_headers: dict
):
    """Submit a video frame, verify sentiment is stored and returned."""
    fake_result = {"emotion": "confused", "confidence": 0.78}
    with patch(
        "app.routers.video.analyze_frame", new=AsyncMock(return_value=fake_result)
    ):
        with patch("app.routers.video.redis_client") as mock_redis:
            mock_redis.setex = AsyncMock()
            resp = await integration_client.post(
                "/api/video/analyze",
                json={
                    "chapter_id": str(uuid.uuid4()),
                    "frame_base64": "aGVsbG8=",  # base64("hello") — placeholder
                },
                headers=auth_headers,
            )

    assert resp.status_code == 200
    body = resp.json()
    assert body["emotion"] == "confused"
    assert body["action_taken"] is not None  # confused → adaptive action


async def test_e2e_sentiment_low_confidence_no_action(
    integration_client: AsyncClient, auth_headers: dict
):
    """Low confidence sentiment should not trigger an adaptive action."""
    fake_result = {"emotion": "bored", "confidence": 0.4}
    with patch(
        "app.routers.video.analyze_frame", new=AsyncMock(return_value=fake_result)
    ):
        with patch("app.routers.video.redis_client") as mock_redis:
            mock_redis.setex = AsyncMock()
            resp = await integration_client.post(
                "/api/video/analyze",
                json={
                    "chapter_id": str(uuid.uuid4()),
                    "frame_base64": "aGVsbG8=",
                },
                headers=auth_headers,
            )

    assert resp.status_code == 200
    assert resp.json()["action_taken"] is None


async def test_e2e_progress_accessible_after_onboarding(
    integration_client: AsyncClient, auth_headers: dict
):
    """After onboarding, GET /progress returns the student's own data."""
    from tests.integration.conftest import TEST_USER_ID

    resp = await integration_client.get(
        f"/api/progress/{TEST_USER_ID}", headers=auth_headers
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["student_id"] == TEST_USER_ID
    assert "subjects" in body


async def test_e2e_progress_not_accessible_to_others(
    integration_client: AsyncClient, auth_headers: dict
):
    """Another student's progress must return 403."""
    other_id = str(uuid.uuid4())
    resp = await integration_client.get(
        f"/api/progress/{other_id}", headers=auth_headers
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Scenario 5: Voice session
# ---------------------------------------------------------------------------


async def test_e2e_voice_session_creation(
    integration_client: AsyncClient,
    auth_headers: dict,
    mock_openai_realtime,
):
    """Client obtains an ephemeral session token for voice."""
    resp = await integration_client.post("/api/voice/session", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["client_secret"] == "ek_test_secret"
    assert body["session_id"] == "sess_test123"


async def test_e2e_voice_session_unauthenticated_rejected(
    integration_client: AsyncClient,
):
    """Voice session without a valid JWT must be rejected."""
    resp = await integration_client.post("/api/voice/session")
    assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Scenario 6: Unauthenticated access is blocked everywhere
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "method,path",
    [
        ("POST", "/api/auth/verify"),
        ("POST", "/api/onboarding"),
        ("POST", f"/api/curriculum/generate"),
        ("GET", f"/api/curriculum/{uuid.uuid4()}"),
        ("GET", f"/api/lessons/{uuid.uuid4()}/content"),
        ("PATCH", f"/api/lessons/{uuid.uuid4()}/status"),
        ("GET", f"/api/lessons/{uuid.uuid4()}/activities"),
        ("POST", f"/api/lessons/{uuid.uuid4()}/chat"),
        ("GET", f"/api/activities/{uuid.uuid4()}"),
        ("POST", f"/api/activities/{uuid.uuid4()}/submit"),
        ("POST", f"/api/activities/{uuid.uuid4()}/evaluate"),
        ("POST", "/api/voice/session"),
        ("POST", "/api/video/analyze"),
        ("GET", f"/api/progress/{uuid.uuid4()}"),
    ],
)
async def test_e2e_all_routes_reject_unauthenticated(
    integration_client: AsyncClient, method: str, path: str
):
    """Every API route must reject requests without a valid JWT."""
    resp = await integration_client.request(method, path)
    assert resp.status_code in (401, 403), (
        f"{method} {path} returned {resp.status_code} — expected 401 or 403"
    )
