import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.dependencies import get_current_user
from app.models.chapter import Chapter
from app.models.subject import Subject
from app.models.student import Student
from app.schemas.curriculum import (
    ChapterSummary,
    CurriculumGenerateRequest,
    CurriculumResponse,
)
from app.services.curriculum_generator import generate_curriculum

router = APIRouter()


@router.post("/generate", response_model=CurriculumResponse)
async def generate_curriculum_endpoint(
    data: CurriculumGenerateRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Generate curriculum via Claude, or return existing one (idempotent)."""
    student_id = uuid.UUID(user["sub"])

    effective_grade = data.grade
    if not effective_grade:
        student_result = await db.execute(select(Student).where(Student.id == student_id))
        student = student_result.scalar_one_or_none()
        effective_grade = student.grade if student and getattr(student, "grade", None) else "10"

    # Return existing curriculum—curricula are preserved on re-onboarding
    existing = await db.execute(
        select(Subject).where(
            Subject.student_id == student_id,
            Subject.name == data.subject_name,
        )
    )
    subject = existing.scalar_one_or_none()
    if subject is not None:
        return await _build_response(subject, db)

    # Create subject row first so we have an id for the FK
    subject = Subject(
        student_id=student_id,
        name=data.subject_name,
        difficulty_level=data.difficulty_level,
        status="in_progress",
    )
    db.add(subject)
    await db.flush()  # assigns subject.id without committing

    try:
        curriculum = await generate_curriculum(
            subject_name=data.subject_name,
            grade=effective_grade,
            background=data.background,
            difficulty_level=data.difficulty_level,
        )
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Curriculum generation failed. Please try again.",
        )

    chapters = curriculum.get("chapters", [])
    for i, ch in enumerate(chapters):
        db.add(
            Chapter(
                subject_id=subject.id,
                order_index=ch.get("order_index", i + 1),
                title=ch.get("title", f"Chapter {i + 1}"),
                description=ch.get("description", ""),
                # First chapter available immediately; rest locked until previous completes
                status="available" if i == 0 else "locked",
                content_json={"learning_objectives": ch.get("learning_objectives", [])},
            )
        )

    await db.commit()
    return await _build_response(subject, db)


@router.get("/{subject_id}", response_model=CurriculumResponse)
async def get_curriculum(
    subject_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Return chapters for a subject (ownership enforced)."""
    subject_uuid = uuid.UUID(subject_id)
    student_id = uuid.UUID(user["sub"])

    result = await db.execute(select(Subject).where(Subject.id == subject_uuid))
    subject = result.scalar_one_or_none()

    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    if subject.student_id != student_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return await _build_response(subject, db)


@router.get("/{subject_id}/chapters/{chapter_id}", response_model=ChapterSummary)
async def get_chapter(
    subject_id: str,
    chapter_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Get a single chapter's metadata."""
    subject_uuid = uuid.UUID(subject_id)
    chapter_uuid = uuid.UUID(chapter_id)
    student_id = uuid.UUID(user["sub"])

    subject_result = await db.execute(
        select(Subject).where(Subject.id == subject_uuid)
    )
    subject = subject_result.scalar_one_or_none()
    if subject is None or subject.student_id != student_id:
        raise HTTPException(status_code=404, detail="Subject not found")

    ch_result = await db.execute(
        select(Chapter).where(
            Chapter.id == chapter_uuid, Chapter.subject_id == subject_uuid
        )
    )
    chapter = ch_result.scalar_one_or_none()
    if chapter is None:
        raise HTTPException(status_code=404, detail="Chapter not found")

    return ChapterSummary(
        id=str(chapter.id),
        order_index=chapter.order_index,
        title=chapter.title,
        description=chapter.description or "",
        status=chapter.status,
        learning_objectives=(
            chapter.content_json.get("learning_objectives", [])
            if chapter.content_json
            else []
        ),
    )


async def _build_response(subject: Subject, db: AsyncSession) -> CurriculumResponse:
    """Build CurriculumResponse from a Subject and its chapters."""
    chapters_result = await db.execute(
        select(Chapter)
        .where(Chapter.subject_id == subject.id)
        .order_by(Chapter.order_index)
    )
    chapters = chapters_result.scalars().all()

    return CurriculumResponse(
        subject_id=str(subject.id),
        subject_name=subject.name,
        chapters=[
            ChapterSummary(
                id=str(c.id),
                order_index=c.order_index,
                title=c.title,
                description=c.description or "",
                status=c.status,
                learning_objectives=(
                    c.content_json.get("learning_objectives", [])
                    if c.content_json
                    else []
                ),
            )
            for c in chapters
        ],
    )
