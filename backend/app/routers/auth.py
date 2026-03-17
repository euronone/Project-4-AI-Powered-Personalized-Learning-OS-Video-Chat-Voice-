import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.dependencies import get_current_user
from app.models.student import Student
from app.schemas.auth import AuthVerifyResponse

router = APIRouter()


@router.post("/verify", response_model=AuthVerifyResponse)
async def verify_token(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Verify Supabase JWT and return user info including onboarding status."""
    user_id_str = user.get("sub")
    onboarding_completed = False

    if user_id_str:
        try:
            result = await db.execute(
                select(Student.onboarding_completed).where(
                    Student.id == uuid.UUID(user_id_str)
                )
            )
            val = result.scalar_one_or_none()
            if val is not None:
                onboarding_completed = val
        except Exception:
            # Student row doesn't exist yet (first login before onboarding)
            pass

    return AuthVerifyResponse(
        user_id=user_id_str,
        email=user.get("email"),
        role=user.get("role"),
        onboarding_completed=onboarding_completed,
    )
