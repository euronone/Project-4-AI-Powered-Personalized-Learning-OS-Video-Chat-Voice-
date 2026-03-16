"""Unit tests for activity_evaluator service and activities router."""
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient

from tests.conftest import TEST_USER_ID

# ---------------------------------------------------------------------------
# Service unit tests
# ---------------------------------------------------------------------------

_VALID_EVALUATION = {
    "score": 78,
    "correctness": {"q1": True, "q2": False},
    "feedback": "Good attempt. Q2 had a minor error.",
    "guidance": "Revisit Newton's Second Law.",
}

_VALID_ACTIVITIES = {
    "activities": [
        {
            "type": "quiz",
            "prompt": {
                "instructions": "Answer all questions.",
                "questions": [{"id": "q1", "text": "What is force?", "type": "short_answer"}],
            },
        },
        {
            "type": "problem_set",
            "prompt": {
                "instructions": "Solve the problems.",
                "questions": [{"id": "q1", "text": "F=ma, find a.", "type": "calculation"}],
            },
        },
    ]
}


def _mock_claude(text: str) -> MagicMock:
    block = MagicMock()
    block.text = text
    resp = MagicMock()
    resp.content = [block]
    return resp


async def test_evaluate_submission_returns_score():
    import json
    from app.services.activity_evaluator import evaluate_submission

    with patch("app.services.activity_evaluator.claude_client") as mock:
        mock.messages.create = AsyncMock(
            return_value=_mock_claude(json.dumps(_VALID_EVALUATION))
        )
        result = await evaluate_submission(
            activity_prompt={"instructions": "What is force?"},
            student_response={"q1": "A push or pull"},
            student_grade="10",
        )

    assert 0 <= result["score"] <= 100
    assert isinstance(result["correctness"], dict)


async def test_evaluate_submission_clamps_score():
    """Score must be clamped to 0-100 even if Claude returns out-of-range."""
    import json
    from app.services.activity_evaluator import evaluate_submission

    bad = dict(_VALID_EVALUATION, score=150)
    with patch("app.services.activity_evaluator.claude_client") as mock:
        mock.messages.create = AsyncMock(return_value=_mock_claude(json.dumps(bad)))
        result = await evaluate_submission({}, {}, "10")

    assert result["score"] == 100


async def test_evaluate_submission_returns_feedback_and_guidance():
    import json
    from app.services.activity_evaluator import evaluate_submission

    with patch("app.services.activity_evaluator.claude_client") as mock:
        mock.messages.create = AsyncMock(
            return_value=_mock_claude(json.dumps(_VALID_EVALUATION))
        )
        result = await evaluate_submission({}, {}, "10")

    assert result["feedback"]
    assert result["guidance"]


async def test_generate_activities_returns_varied_types():
    import json
    from app.services.activity_evaluator import generate_activities

    with patch("app.services.activity_evaluator.claude_client") as mock:
        mock.messages.create = AsyncMock(
            return_value=_mock_claude(json.dumps(_VALID_ACTIVITIES))
        )
        result = await generate_activities(
            chapter_content={"key_concepts": ["Force"], "summary": "Motion"},
            subject_name="Physics",
            grade="10",
        )

    types = {a["type"] for a in result}
    assert len(types) >= 2  # at least 2 different activity types


# ---------------------------------------------------------------------------
# Router tests
# ---------------------------------------------------------------------------


async def test_get_activity_returns_prompt(http_client: AsyncClient, mock_db):
    from app.models.activity import Activity as ActivityModel
    import uuid as _uuid

    act_id = _uuid.uuid4()
    fake_act = MagicMock(spec=ActivityModel)
    fake_act.id = act_id
    fake_act.chapter_id = _uuid.uuid4()
    fake_act.type = "quiz"
    fake_act.status = "pending"
    fake_act.prompt_json = {"instructions": "Answer this."}

    result = MagicMock()
    result.scalar_one_or_none.return_value = fake_act
    mock_db.execute.return_value = result

    resp = await http_client.get(f"/api/activities/{act_id}")
    assert resp.status_code == 200
    assert resp.json()["type"] == "quiz"


async def test_get_activity_returns_404_for_missing(http_client: AsyncClient):
    resp = await http_client.get(f"/api/activities/{uuid.uuid4()}")
    assert resp.status_code == 404


async def test_submit_activity_saves_response(http_client: AsyncClient, mock_db):
    from app.models.activity import Activity as ActivityModel
    import uuid as _uuid

    act_id = _uuid.uuid4()
    fake_act = MagicMock(spec=ActivityModel)
    fake_act.id = act_id
    fake_act.chapter_id = _uuid.uuid4()
    fake_act.type = "quiz"
    fake_act.status = "pending"
    fake_act.prompt_json = {}

    activity_result = MagicMock()
    activity_result.scalar_one_or_none.return_value = fake_act

    # No existing submission
    no_submission = MagicMock()
    no_submission.scalar_one_or_none.return_value = None

    mock_db.execute.side_effect = [activity_result, no_submission]

    resp = await http_client.post(
        f"/api/activities/{act_id}/submit",
        json={"responses": {"q1": "Force is a push or pull"}},
    )
    assert resp.status_code == 200
    assert resp.json()["submitted"] is True
    mock_db.add.assert_called()
    mock_db.commit.assert_awaited()


async def test_submit_activity_rejects_duplicate(http_client: AsyncClient, mock_db):
    from app.models.activity import Activity as ActivityModel, ActivitySubmission
    import uuid as _uuid

    act_id = _uuid.uuid4()
    fake_act = MagicMock(spec=ActivityModel)
    fake_act.id = act_id
    fake_act.chapter_id = _uuid.uuid4()
    fake_act.type = "quiz"
    fake_act.status = "submitted"
    fake_act.prompt_json = {}

    fake_sub = MagicMock(spec=ActivitySubmission)

    activity_result = MagicMock()
    activity_result.scalar_one_or_none.return_value = fake_act
    existing_result = MagicMock()
    existing_result.scalar_one_or_none.return_value = fake_sub

    mock_db.execute.side_effect = [activity_result, existing_result]

    resp = await http_client.post(
        f"/api/activities/{act_id}/submit",
        json={"responses": {"q1": "answer"}},
    )
    assert resp.status_code == 409


async def test_evaluate_activity_returns_score(http_client: AsyncClient, mock_db):
    import json
    from app.models.activity import Activity as ActivityModel, ActivitySubmission
    from app.models.student import Student
    import uuid as _uuid

    act_id = _uuid.uuid4()
    fake_act = MagicMock(spec=ActivityModel)
    fake_act.id = act_id
    fake_act.chapter_id = _uuid.uuid4()
    fake_act.type = "quiz"
    fake_act.status = "submitted"
    fake_act.prompt_json = {"instructions": "Explain force."}

    fake_sub = MagicMock(spec=ActivitySubmission)
    fake_sub.response_json = {"q1": "A push or pull"}
    fake_sub.score = None
    fake_sub.evaluation_json = None

    fake_student = MagicMock(spec=Student)
    fake_student.grade = "10"

    activity_result = MagicMock()
    activity_result.scalar_one_or_none.return_value = fake_act
    submission_result = MagicMock()
    submission_result.scalar_one_or_none.return_value = fake_sub
    student_result = MagicMock()
    student_result.scalar_one_or_none.return_value = fake_student

    mock_db.execute.side_effect = [activity_result, submission_result, student_result]

    with patch(
        "app.routers.activities.evaluate_submission",
        new=AsyncMock(return_value=_VALID_EVALUATION),
    ):
        resp = await http_client.post(f"/api/activities/{act_id}/evaluate")

    assert resp.status_code == 200
    data = resp.json()
    assert 0 <= data["score"] <= 100
    assert data["feedback"]


async def test_evaluate_requires_prior_submission(http_client: AsyncClient, mock_db):
    from app.models.activity import Activity as ActivityModel
    import uuid as _uuid

    act_id = _uuid.uuid4()
    fake_act = MagicMock(spec=ActivityModel)
    fake_act.id = act_id
    fake_act.chapter_id = _uuid.uuid4()
    fake_act.type = "quiz"
    fake_act.status = "pending"
    fake_act.prompt_json = {}

    activity_result = MagicMock()
    activity_result.scalar_one_or_none.return_value = fake_act
    no_submission = MagicMock()
    no_submission.scalar_one_or_none.return_value = None

    mock_db.execute.side_effect = [activity_result, no_submission]

    resp = await http_client.post(f"/api/activities/{act_id}/evaluate")
    assert resp.status_code == 422

