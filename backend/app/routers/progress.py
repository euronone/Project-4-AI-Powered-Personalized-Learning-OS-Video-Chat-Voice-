import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.dependencies import get_current_user
from app.models.progress import StudentProgress
from app.models.subject import Subject
from app.schemas.progress import ProgressResponse, SubjectProgress

router = APIRouter()


@router.get("/{student_id}", response_model=ProgressResponse)
async def get_progress(
    student_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Get student progress and analytics. Students can only view their own data."""
    current_user_id = user["sub"]
    if student_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    try:
        student_uuid = uuid.UUID(student_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid student_id")

    # Fetch all subjects to get names
    subjects_result = await db.execute(
        select(Subject).where(Subject.student_id == student_uuid)
    )
    subjects = subjects_result.scalars().all()
    subject_name_map = {s.id: s.name for s in subjects}

    # Fetch progress rows
    progress_result = await db.execute(
        select(StudentProgress).where(StudentProgress.student_id == student_uuid)
    )
    progress_rows = progress_result.scalars().all()

    subject_progress_list = []
    for row in progress_rows:
        subject_progress_list.append(
            SubjectProgress(
                subject_id=str(row.subject_id),
                subject_name=subject_name_map.get(row.subject_id, ""),
                chapters_completed=row.chapters_completed,
                total_chapters=row.total_chapters,
                average_score=row.average_score,
                strengths=row.strengths or [],
                weaknesses=row.weaknesses or [],
            )
        )

    return ProgressResponse(student_id=student_id, subjects=subject_progress_list)
