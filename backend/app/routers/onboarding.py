import asyncio
import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.database import get_db_session
from app.core.supabase_client import get_supabase_client
from app.dependencies import get_current_user
from app.models.student import Student
from app.models.subject import Subject
from app.schemas.onboarding import OnboardingRequest, OnboardingResponse

router = APIRouter()

# Backward compatibility for tests that patch app.routers.onboarding.supabase_client
supabase_client = None

_ALLOWED_MIME: frozenset[str] = frozenset(settings.allowed_upload_extensions)
_MAX_BYTES: int = settings.max_upload_size_mb * 1024 * 1024


@router.post("", response_model=OnboardingResponse)
async def save_onboarding(
    data: OnboardingRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Save student profile and create subject rows for selected interests."""
    student_id = uuid.UUID(user["sub"])

    # Upsert student row
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()

    if student is None:
        student = Student(
            id=student_id,
            name=data.name,
            grade=data.grade,
            background=data.background,
            interests=data.interests,
            onboarding_completed=True,
        )
        db.add(student)
    else:
        student.name = data.name
        student.grade = data.grade
        student.background = data.background
        student.interests = data.interests
        student.onboarding_completed = True

    # Create subjects only for interests not already present—preserve existing curricula
    existing_result = await db.execute(
        select(Subject.name).where(Subject.student_id == student_id)
    )
    existing_names = {row[0] for row in existing_result.fetchall()}

    new_subjects: list[str] = []
    for interest in data.interests:
        if interest not in existing_names:
            db.add(Subject(student_id=student_id, name=interest))
            new_subjects.append(interest)

    await db.commit()

    return OnboardingResponse(
        student_id=str(student_id),
        onboarding_completed=True,
        subjects_created=new_subjects,
    )


@router.post("/marksheet")
async def upload_marksheet(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Upload student marksheet to Supabase Storage (images and PDFs only)."""
    # Validate MIME type before reading the full file
    if file.content_type not in _ALLOWED_MIME:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type. Allowed: {', '.join(sorted(_ALLOWED_MIME))}",
        )

    content = await file.read()
    if len(content) > _MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"File exceeds {settings.max_upload_size_mb} MB limit.",
        )

    # Sanitise filename—guard against path traversal attacks
    safe_name = os.path.basename(file.filename or "upload")
    if not safe_name or safe_name in (".", ".."):
        safe_name = "upload"
    storage_path = f"{user['sub']}/{safe_name}"

    # Upload via sync Supabase SDK, offloaded to thread pool to avoid blocking
    supabase = get_supabase_client()
    await asyncio.to_thread(
        _sync_upload,
        supabase,
        "marksheets",
        storage_path,
        content,
        file.content_type or "application/octet-stream",
    )

    # Record storage path on the student row
    student_id = uuid.UUID(user["sub"])
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    if student:
        student.marksheet_path = storage_path
        await db.commit()

    return {"path": storage_path}


def _sync_upload(
    supabase, bucket: str, path: str, content: bytes, content_type: str
) -> None:
    """Synchronous Supabase Storage upload (called via asyncio.to_thread)."""
    supabase.storage.from_(bucket).upload(
        path=path,
        file=content,
        file_options={"content-type": content_type, "upsert": "true"},
    )
