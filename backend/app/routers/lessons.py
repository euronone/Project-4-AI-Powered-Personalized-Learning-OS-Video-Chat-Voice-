import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import create_session, get_db_session
from app.dependencies import get_current_user
from app.models.activity import Activity
from app.models.chapter import Chapter
from app.models.chat_message import ChatMessage
from app.models.student import Student
from app.models.subject import Subject
from app.schemas.lesson import ChatRequest, ChapterStatusUpdate
from app.services.curriculum_generator import generate_chapter_content
from app.services.teaching_engine import stream_teaching_response
from app.services.activity_evaluator import generate_activities

router = APIRouter()


@router.get("/{chapter_id}/content")
async def get_lesson_content(
    chapter_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Return chapter content. Generates via Claude on first request (lazy)."""
    chapter, student = await _get_chapter_and_student(chapter_id, user, db)

    # Return cached content if the text field is already populated
    if chapter.content_json and chapter.content_json.get("text"):
        return chapter.content_json

    subject_result = await db.execute(
        select(Subject).where(Subject.id == chapter.subject_id)
    )
    subject = subject_result.scalar_one_or_none()

    try:
        generated = await generate_chapter_content(
            chapter_title=chapter.title,
            chapter_description=chapter.description or "",
            subject_name=subject.name if subject else "",
            grade=student.grade if student else "10",
            student_background=student.background if student else None,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Content generation failed. Please try again.",
        )

    # Merge: keep learning_objectives from curriculum generation, add new content
    merged = {**(chapter.content_json or {}), **generated}
    chapter.content_json = merged
    await db.commit()
    return merged


@router.patch("/{chapter_id}/status")
async def update_chapter_status(
    chapter_id: str,
    data: ChapterStatusUpdate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Update chapter status. Completing a chapter unlocks the next one."""
    chapter, _ = await _get_chapter_and_student(chapter_id, user, db)

    chapter.status = data.status

    if data.status == "completed":
        next_result = await db.execute(
            select(Chapter).where(
                Chapter.subject_id == chapter.subject_id,
                Chapter.order_index == chapter.order_index + 1,
            )
        )
        next_chapter = next_result.scalar_one_or_none()
        if next_chapter and next_chapter.status == "locked":
            next_chapter.status = "available"

        # Auto-generate activities when chapter is completed
        # Runs in the background via a fire-and-forget task so it doesn't block the response
        subject_result = await db.execute(
            select(Subject).where(Subject.id == chapter.subject_id)
        )
        subject = subject_result.scalar_one_or_none()
        student_result = await db.execute(
            select(Student).where(Student.id == uuid.UUID(user["sub"]))
        )
        student = student_result.scalar_one_or_none()

        if chapter.content_json and chapter.content_json.get("key_concepts"):
            try:
                raw_activities = await generate_activities(
                    chapter_content=chapter.content_json,
                    subject_name=subject.name if subject else "",
                    grade=student.grade if student else "10",
                )
                for act in raw_activities:
                    db.add(
                        Activity(
                            chapter_id=chapter.id,
                            type=act.get("type", "quiz"),
                            prompt_json=act.get("prompt", {}),
                        )
                    )
            except Exception:
                # Activity generation failure must not block chapter completion
                pass

    await db.commit()
    return {"chapter_id": chapter_id, "status": data.status}


@router.get("/{chapter_id}/activities")
async def list_chapter_activities(
    chapter_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """List all activities for a chapter."""
    chapter, _ = await _get_chapter_and_student(chapter_id, user, db)

    result = await db.execute(
        select(Activity).where(Activity.chapter_id == chapter.id)
    )
    activities = result.scalars().all()

    return [
        {"id": str(a.id), "type": a.type, "status": a.status, "prompt": a.prompt_json}
        for a in activities
    ]


@router.post("/{chapter_id}/chat")
async def teaching_chat(
    chapter_id: str,
    data: ChatRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Stream a Socratic tutoring response via Server-Sent Events."""
    chapter, student = await _get_chapter_and_student(chapter_id, user, db)
    chapter_uuid = chapter.id
    student_id = uuid.UUID(user["sub"])

    # Persist student message before streaming begins
    db.add(
        ChatMessage(
            chapter_id=chapter_uuid,
            student_id=student_id,
            role="student",
            content=data.message,
        )
    )
    await db.commit()

    async def event_stream():
        response_parts: list[str] = []
        try:
            async for chunk in stream_teaching_response(
                chapter_content=chapter.content_json or {},
                student_message=data.message,
                conversation_history=data.conversation_history,
                student_grade=student.grade if student else "10",
                student_background=student.background if student else None,
            ):
                response_parts.append(chunk)
                yield f"data: {json.dumps({'content': chunk})}\n\n"
        except Exception:
            yield f"data: {json.dumps({'error': 'Stream interrupted'})}\n\n"
        finally:
            yield "data: [DONE]\n\n"
            # Persist the complete tutor response in a fresh session
            full_content = "".join(response_parts)
            if full_content:
                async with create_session() as persist_db:
                    persist_db.add(
                        ChatMessage(
                            chapter_id=chapter_uuid,
                            student_id=student_id,
                            role="tutor",
                            content=full_content,
                        )
                    )
                    await persist_db.commit()

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff"},
    )


async def _get_chapter_and_student(
    chapter_id: str, user: dict, db: AsyncSession
) -> tuple[Chapter, Student | None]:
    """Fetch chapter with ownership check via subject join. Raises 404 if not found."""
    chapter_uuid = uuid.UUID(chapter_id)
    student_id = uuid.UUID(user["sub"])

    result = await db.execute(
        select(Chapter)
        .join(Subject, Chapter.subject_id == Subject.id)
        .where(Chapter.id == chapter_uuid, Subject.student_id == student_id)
    )
    chapter = result.scalar_one_or_none()
    if chapter is None:
        raise HTTPException(status_code=404, detail="Chapter not found")

    student_result = await db.execute(select(Student).where(Student.id == student_id))
    student = student_result.scalar_one_or_none()
    return chapter, student
