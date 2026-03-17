from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
import uuid

from app.models.activity import Activity, ActivitySubmission

class ActivityRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_activity_by_id(self, activity_id: uuid.UUID) -> Optional[Activity]:
        result = await self.session.execute(select(Activity).filter(Activity.id == activity_id))
        return result.scalars().first()

    async def get_activities_by_chapter_id(self, chapter_id: uuid.UUID) -> List[Activity]:
        result = await self.session.execute(select(Activity).filter(Activity.chapter_id == chapter_id))
        return result.scalars().all()

    async def create_activity(self, activity: Activity) -> Activity:
        self.session.add(activity)
        await self.session.flush()
        return activity

    async def save_activities(self, activities: List[Activity]) -> List[Activity]:
        self.session.add_all(activities)
        await self.session.flush()
        return activities

    async def get_submission_by_id(self, submission_id: uuid.UUID) -> Optional[ActivitySubmission]:
        result = await self.session.execute(select(ActivitySubmission).filter(ActivitySubmission.id == submission_id))
        return result.scalars().first()
        
    async def get_submissions_by_student_and_chapter(self, student_id: uuid.UUID, chapter_id: uuid.UUID) -> List[ActivitySubmission]:
        result = await self.session.execute(
            select(ActivitySubmission)
            .join(Activity)
            .filter(ActivitySubmission.student_id == student_id)
            .filter(Activity.chapter_id == chapter_id)
        )
        return result.scalars().all()

    async def save_activity_submission(self, submission: ActivitySubmission) -> ActivitySubmission:
        self.session.add(submission)
        await self.session.flush()
        return submission

    async def update_activity_submission(self, submission: ActivitySubmission) -> ActivitySubmission:
        merged = await self.session.merge(submission)
        await self.session.flush()
        return merged
