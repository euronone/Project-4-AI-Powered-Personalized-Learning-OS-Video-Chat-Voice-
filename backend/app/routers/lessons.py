import json
import logging

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user
from app.core.database import get_db_session
from app.schemas.lesson import ChatRequest
from app.services.teaching_engine import stream_teaching_response, get_teaching_response

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/{chapter_id}/content")
async def get_lesson_content(
    chapter_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Get or generate chapter content (text, diagrams, formulas)."""
    # TODO: Fetch or generate via teaching_engine service
    pass


@router.post("/{chapter_id}/chat")
async def teaching_chat(
    chapter_id: str,
    data: ChatRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Streaming teaching chat via SSE."""

    async def event_stream():
        try:
            async for chunk in stream_teaching_response(
                chapter_content=None,  # TODO: fetch chapter content from DB
                student_message=data.message,
                conversation_history=data.conversation_history,
            ):
                escaped = json.dumps(chunk)
                yield f"data: {escaped}\n\n"
            yield "data: [DONE]\n\n"
        except Exception:
            logger.exception("SSE stream error")
            yield f"data: {json.dumps('[ERROR]')}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/{chapter_id}/chat/sync")
async def teaching_chat_sync(
    chapter_id: str,
    data: ChatRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Non-streaming teaching chat — returns full response at once."""
    response = await get_teaching_response(
        chapter_content=None,  # TODO: fetch chapter content from DB
        student_message=data.message,
        conversation_history=data.conversation_history,
    )
    return {"role": "assistant", "content": response}


@router.post("/chat")
async def general_chat(data: ChatRequest):
    """General AI tutor chat (no chapter context, no auth required for demo)."""
    response = await get_teaching_response(
        chapter_content=None,
        student_message=data.message,
        conversation_history=data.conversation_history,
    )
    return {"role": "assistant", "content": response}


@router.post("/chat/stream")
async def general_chat_stream(data: ChatRequest):
    """General AI tutor streaming chat (no chapter context, no auth required for demo)."""

    async def event_stream():
        try:
            async for chunk in stream_teaching_response(
                chapter_content=None,
                student_message=data.message,
                conversation_history=data.conversation_history,
            ):
                escaped = json.dumps(chunk)
                yield f"data: {escaped}\n\n"
            yield "data: [DONE]\n\n"
        except Exception:
            logger.exception("SSE stream error")
            yield f"data: {json.dumps('[ERROR]')}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
