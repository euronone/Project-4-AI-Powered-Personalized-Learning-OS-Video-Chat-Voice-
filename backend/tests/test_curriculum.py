"""Unit tests for curriculum_generator service and curriculum/lesson routes."""
import uuid
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient

from tests.conftest import TEST_USER_ID

# ---------------------------------------------------------------------------
# Service unit tests (mock Claude—no DB, no network)
# ---------------------------------------------------------------------------

_VALID_CURRICULUM = {
    "chapters": [
        {
            "order_index": i + 1,
            "title": f"Chapter {i + 1}",
            "description": "Desc",
            "learning_objectives": ["Obj A"],
        }
        for i in range(8)
    ]
}

_VALID_CONTENT = {
    "text": "Lesson text here.",
    "diagrams": ["flowchart LR\n  A-->B"],
    "formulas": ["F = ma"],
    "key_concepts": ["Force", "Mass"],
    "summary": "Summary here.",
}


def _mock_claude_response(text: str) -> MagicMock:
    """Build a mock that looks like Claude's messages.create response."""
    content_block = MagicMock()
    content_block.text = text
    response = MagicMock()
    response.content = [content_block]
    return response


async def test_generate_curriculum_returns_chapters():
    import json
    from app.services.curriculum_generator import generate_curriculum

    with patch(
        "app.services.curriculum_generator.claude_client"
    ) as mock_client:
        mock_client.messages.create = AsyncMock(
            return_value=_mock_claude_response(json.dumps(_VALID_CURRICULUM))
        )
        result = await generate_curriculum("Physics", "10", None, "beginner")

    assert "chapters" in result
    assert len(result["chapters"]) == 8


async def test_generate_curriculum_retries_on_bad_json():
    """First call returns unparseable text; second call returns valid JSON."""
    import json
    from app.services.curriculum_generator import generate_curriculum

    bad_response = _mock_claude_response("Sorry, I cannot do that.")
    good_response = _mock_claude_response(json.dumps(_VALID_CURRICULUM))

    with patch(
        "app.services.curriculum_generator.claude_client"
    ) as mock_client:
        mock_client.messages.create = AsyncMock(
            side_effect=[bad_response, good_response]
        )
        result = await generate_curriculum("Physics", "10", None, "beginner")

    assert "chapters" in result


async def test_generate_chapter_content_has_required_keys():
    import json
    from app.services.curriculum_generator import generate_chapter_content

    with patch(
        "app.services.curriculum_generator.claude_client"
    ) as mock_client:
        mock_client.messages.create = AsyncMock(
            return_value=_mock_claude_response(json.dumps(_VALID_CONTENT))
        )
        result = await generate_chapter_content(
            "Newton's Laws", "Motion basics", "Physics", "10", None
        )

    for key in ("text", "diagrams", "formulas", "key_concepts", "summary"):
        assert key in result, f"Missing key: {key}"


# ---------------------------------------------------------------------------
# Curriculum router tests (mock DB + mock Claude)
# ---------------------------------------------------------------------------


async def test_get_curriculum_returns_404_for_missing_subject(
    http_client: AsyncClient,
):
    resp = await http_client.get(f"/api/curriculum/{uuid.uuid4()}")
    assert resp.status_code == 404


async def test_get_curriculum_returns_403_wrong_owner(
    http_client: AsyncClient, mock_db
):
    """Subject exists but belongs to a different student."""
    import uuid as _uuid
    from app.models.subject import Subject

    fake_subject = MagicMock(spec=Subject)
    fake_subject.id = _uuid.uuid4()
    fake_subject.student_id = _uuid.uuid4()  # different owner
    fake_subject.name = "Physics"
    fake_subject.status = "in_progress"
    fake_subject.difficulty_level = "beginner"

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_subject
    mock_db.execute.return_value = mock_result

    resp = await http_client.get(f"/api/curriculum/{fake_subject.id}")
    assert resp.status_code == 403


async def test_generate_curriculum_returns_existing_when_subject_present(
    http_client: AsyncClient, mock_db
):
    """If subject already exists, return its chapters without calling Claude."""
    import uuid as _uuid
    from app.models.subject import Subject
    from app.models.chapter import Chapter

    subject_id = _uuid.uuid4()
    fake_subject = MagicMock(spec=Subject)
    fake_subject.id = subject_id
    fake_subject.student_id = _uuid.UUID(TEST_USER_ID)
    fake_subject.name = "Physics"

    # First execute: returns existing subject. Second: returns chapters list.
    subject_result = MagicMock()
    subject_result.scalar_one_or_none.return_value = fake_subject

    chapters_result = MagicMock()
    chapters_result.scalars.return_value.all.return_value = []

    mock_db.execute.side_effect = [subject_result, chapters_result]

    with patch("app.routers.curriculum.generate_curriculum") as mock_gen:
        resp = await http_client.post(
            "/api/curriculum/generate",
            json={"subject_name": "Physics", "grade": "10"},
        )
        mock_gen.assert_not_called()

    assert resp.status_code == 200
    assert resp.json()["subject_name"] == "Physics"


# ---------------------------------------------------------------------------
# Lesson content route tests
# ---------------------------------------------------------------------------


async def test_get_lesson_content_returns_cached(
    http_client: AsyncClient, mock_db
):
    """When content_json already has text, Claude should not be called."""
    from app.models.chapter import Chapter
    import uuid as _uuid

    chapter_id = _uuid.uuid4()
    fake_chapter = MagicMock(spec=Chapter)
    fake_chapter.id = chapter_id
    fake_chapter.title = "Newton's Laws"
    fake_chapter.description = "Motion"
    fake_chapter.subject_id = _uuid.uuid4()
    fake_chapter.content_json = {"text": "Cached content.", "key_concepts": []}

    chapter_result = MagicMock()
    chapter_result.scalar_one_or_none.return_value = fake_chapter

    student_result = MagicMock()
    student_result.scalar_one_or_none.return_value = None

    # execute calls: chapter join, student
    mock_db.execute.side_effect = [chapter_result, student_result]

    with patch("app.routers.lessons.generate_chapter_content") as mock_gen:
        resp = await http_client.get(f"/api/lessons/{chapter_id}/content")
        mock_gen.assert_not_called()

    assert resp.status_code == 200
    assert resp.json()["text"] == "Cached content."


async def test_get_lesson_content_returns_404_for_missing(
    http_client: AsyncClient,
):
    resp = await http_client.get(f"/api/lessons/{uuid.uuid4()}/content")
    assert resp.status_code == 404


async def test_update_chapter_status_unlocks_next(
    http_client: AsyncClient, mock_db
):
    """Completing a chapter should set next chapter status to 'available'."""
    from app.models.chapter import Chapter
    from app.models.student import Student
    import uuid as _uuid

    chapter_id = _uuid.uuid4()
    next_id = _uuid.uuid4()
    subject_id = _uuid.uuid4()

    current = MagicMock(spec=Chapter)
    current.id = chapter_id
    current.order_index = 1
    current.subject_id = subject_id
    current.status = "in_progress"
    current.content_json = None  # no key_concepts → skip activity generation branch

    next_ch = MagicMock(spec=Chapter)
    next_ch.id = next_id
    next_ch.status = "locked"

    # execute calls:
    #   1. _get_chapter_and_student: chapter join query
    #   2. _get_chapter_and_student: student query
    #   3. update_chapter_status: next chapter query
    #   4. update_chapter_status: subject query (always runs on completed)
    #   5. update_chapter_status: student query (always runs on completed)
    chapter_result = MagicMock()
    chapter_result.scalar_one_or_none.return_value = current
    student_result = MagicMock()
    student_result.scalar_one_or_none.return_value = None
    next_result = MagicMock()
    next_result.scalar_one_or_none.return_value = next_ch
    subject_result = MagicMock()
    subject_result.scalar_one_or_none.return_value = None
    student_result2 = MagicMock()
    student_result2.scalar_one_or_none.return_value = None

    mock_db.execute.side_effect = [
        chapter_result,
        student_result,
        next_result,
        subject_result,
        student_result2,
    ]

    resp = await http_client.patch(
        f"/api/lessons/{chapter_id}/status",
        json={"status": "completed"},
    )
    assert resp.status_code == 200
    assert next_ch.status == "available"


async def test_list_activities_returns_empty_list(
    http_client: AsyncClient, mock_db
):
    from app.models.chapter import Chapter
    import uuid as _uuid

    chapter_id = _uuid.uuid4()
    fake_chapter = MagicMock(spec=Chapter)
    fake_chapter.id = chapter_id
    fake_chapter.subject_id = _uuid.uuid4()

    chapter_result = MagicMock()
    chapter_result.scalar_one_or_none.return_value = fake_chapter
    student_result = MagicMock()
    student_result.scalar_one_or_none.return_value = None
    activities_result = MagicMock()
    activities_result.scalars.return_value.all.return_value = []

    mock_db.execute.side_effect = [chapter_result, student_result, activities_result]

    resp = await http_client.get(f"/api/lessons/{chapter_id}/activities")
    assert resp.status_code == 200
    assert resp.json() == []

