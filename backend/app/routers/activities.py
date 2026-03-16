import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.dependencies import get_current_user
from app.models.activity import Activity, ActivitySubmission
from app.models.chapter import Chapter
from app.models.student import Student
from app.models.subject import Subject
from app.schemas.activity import (
    ActivityDetail,
    ActivityEvaluationResponse,
    ActivitySubmitRequest,
)
from app.services.activity_evaluator import evaluate_submission

router = APIRouter()


@router.get("/{activity_id}", response_model=ActivityDetail)
async def get_activity(
    activity_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Return a single activity's prompt."""
    activity, _ = await _get_activity_with_ownership(activity_id, user, db)
    return ActivityDetail(
        id=str(activity.id),
        chapter_id=str(activity.chapter_id),
        type=activity.type,
        status=activity.status,
        prompt=activity.prompt_json,
    )


@router.post("/{activity_id}/submit")
async def submit_activity(
    activity_id: str,
    data: ActivitySubmitRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Save student response. Rejects duplicate submissions with 409."""
    activity, student_id = await _get_activity_with_ownership(activity_id, user, db)

    # Reject if already submitted
    existing = await db.execute(
        select(ActivitySubmission).where(
            ActivitySubmission.activity_id == activity.id,
            ActivitySubmission.student_id == student_id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Activity already submitted.",
        )

    submission = ActivitySubmission(
        activity_id=activity.id,
        student_id=student_id,
        response_json=data.responses,
    )
    db.add(submission)
    activity.status = "submitted"
    await db.commit()
    return {"activity_id": activity_id, "submitted": True}


@router.post("/{activity_id}/evaluate", response_model=ActivityEvaluationResponse)
async def evaluate_activity(
    activity_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """AI-evaluate a submitted activity. Requires prior submission."""
    activity, student_id = await _get_activity_with_ownership(activity_id, user, db)

    submission_result = await db.execute(
        select(ActivitySubmission).where(
            ActivitySubmission.activity_id == activity.id,
            ActivitySubmission.student_id == student_id,
        )
    )
    submission = submission_result.scalar_one_or_none()
    if submission is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Activity must be submitted before evaluation.",
        )

    # Fetch student grade for context-appropriate feedback
    student_result = await db.execute(select(Student).where(Student.id == student_id))
    student = student_result.scalar_one_or_none()
    grade = student.grade if student else "10"

    try:
        evaluation = await evaluate_submission(
            activity_prompt=activity.prompt_json or {},
            student_response=submission.response_json or {},
            student_grade=grade,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Evaluation failed. Please try again.",
        )

    submission.evaluation_json = evaluation
    submission.score = evaluation["score"]
    activity.status = "evaluated"
    await db.commit()

    return ActivityEvaluationResponse(
        activity_id=activity_id,
        score=evaluation["score"],
        correctness=evaluation.get("correctness", {}),
        feedback=evaluation.get("feedback", ""),
        guidance=evaluation.get("guidance", ""),
    )


async def _get_activity_with_ownership(
    activity_id: str, user: dict, db: AsyncSession
) -> tuple[Activity, uuid.UUID]:
    """Fetch activity and verify it belongs to the requesting student's chapter."""
    activity_uuid = uuid.UUID(activity_id)
    student_id = uuid.UUID(user["sub"])

    result = await db.execute(
        select(Activity)
        .join(Chapter, Activity.chapter_id == Chapter.id)
        .join(Subject, Chapter.subject_id == Subject.id)
        .where(Activity.id == activity_uuid, Subject.student_id == student_id)
    )
    activity = result.scalar_one_or_none()
    if activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity, student_id
