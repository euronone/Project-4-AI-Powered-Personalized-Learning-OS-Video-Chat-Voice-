"""Unit tests for teaching_engine service and /chat SSE route."""
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient

from tests.conftest import TEST_USER_ID


# ---------------------------------------------------------------------------
# Service unit tests
# ---------------------------------------------------------------------------


async def test_stream_teaching_response_yields_chunks():
    from app.services.teaching_engine import stream_teaching_response

    async def _fake_text_stream():
        for word in ["Hello ", "student!"]:
            yield word

    mock_stream_ctx = AsyncMock()
    mock_stream_ctx.__aenter__ = AsyncMock(
        return_value=MagicMock(text_stream=_fake_text_stream())
    )
    mock_stream_ctx.__aexit__ = AsyncMock(return_value=False)

    with patch("app.services.teaching_engine.claude_client") as mock_client:
        mock_client.messages.stream.return_value = mock_stream_ctx
        chunks = [
            c
            async for c in stream_teaching_response(
                chapter_content={"text": "Newton", "key_concepts": ["Force"]},
                student_message="What is force?",
                conversation_history=[],
                student_grade="10",
                student_background=None,
            )
        ]

    assert len(chunks) == 2
    assert "".join(chunks) == "Hello student!"


def test_system_prompt_contains_grade():
    from app.services.teaching_engine import _SYSTEM_TEMPLATE

    prompt = _SYSTEM_TEMPLATE.format(
        grade="7",
        background="curious learner",
        key_concepts="Force, Motion",
        chapter_text="Short overview",
    )
    assert "grade 7" in prompt


def test_system_prompt_contains_socratic_method():
    from app.services.teaching_engine import _SYSTEM_TEMPLATE

    prompt = _SYSTEM_TEMPLATE.format(
        grade="10",
        background="Standard",
        key_concepts="",
        chapter_text="",
    )
    assert "Socratic" in prompt


# ---------------------------------------------------------------------------
# Chat route tests (mock DB + mock service)
# ---------------------------------------------------------------------------


async def test_chat_streams_sse_events(http_client: AsyncClient, mock_db):
    import uuid as _uuid
    from app.models.chapter import Chapter
    from app.models.student import Student

    chapter_id = _uuid.uuid4()
    fake_chapter = MagicMock(spec=Chapter)
    fake_chapter.id = chapter_id
    fake_chapter.subject_id = _uuid.uuid4()
    fake_chapter.content_json = {"text": "Newton", "key_concepts": ["Force"]}

    fake_student = MagicMock(spec=Student)
    fake_student.id = _uuid.UUID(TEST_USER_ID)
    fake_student.grade = "10"
    fake_student.background = None

    chapter_result = MagicMock()
    chapter_result.scalar_one_or_none.return_value = fake_chapter
    student_result = MagicMock()
    student_result.scalar_one_or_none.return_value = fake_student

    mock_db.execute.side_effect = [chapter_result, student_result]

    async def _fake_stream(*args, **kwargs):
        for word in ["Great ", "question!"]:
            yield word

    with patch(
        "app.routers.lessons.stream_teaching_response", side_effect=_fake_stream
    ), patch("app.routers.lessons.create_session") as mock_session_factory:
        # Stub the persist-session context manager
        mock_persist_db = AsyncMock()
        mock_persist_db.__aenter__ = AsyncMock(return_value=mock_persist_db)
        mock_persist_db.__aexit__ = AsyncMock(return_value=False)
        mock_persist_db.add = MagicMock()
        mock_persist_db.commit = AsyncMock()
        mock_session_factory.return_value = mock_persist_db

        resp = await http_client.post(
            f"/api/lessons/{chapter_id}/chat",
            json={"message": "What is force?", "conversation_history": []},
        )

    assert resp.status_code == 200
    assert "text/event-stream" in resp.headers["content-type"]
    body = resp.text
    assert "data:" in body
    assert "[DONE]" in body


async def test_chat_returns_404_for_missing_chapter(http_client: AsyncClient):
    resp = await http_client.post(
        f"/api/lessons/{uuid.uuid4()}/chat",
        json={"message": "hello", "conversation_history": []},
    )
    assert resp.status_code == 404

