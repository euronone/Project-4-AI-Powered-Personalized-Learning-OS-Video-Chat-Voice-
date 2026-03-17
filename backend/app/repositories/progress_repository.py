from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
import uuid

from app.models.progress import StudentProgress

class ProgressRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_progress_by_student_and_subject(self, student_id: uuid.UUID, subject_id: uuid.UUID) -> Optional[StudentProgress]:
        result = await self.session.execute(
            select(StudentProgress)
            .filter(StudentProgress.student_id == student_id)
            .filter(StudentProgress.subject_id == subject_id)
        )
        return result.scalars().first()

    async def get_all_progress_for_student(self, student_id: uuid.UUID) -> List[StudentProgress]:
        result = await self.session.execute(
            select(StudentProgress).filter(StudentProgress.student_id == student_id)
        )
        return result.scalars().all()

    async def create_progress(self, progress: StudentProgress) -> StudentProgress:
        self.session.add(progress)
        await self.session.flush()
        return progress

    async def update_progress(self, progress: StudentProgress) -> StudentProgress:
        merged = await self.session.merge(progress)
        await self.session.flush()
        return merged
