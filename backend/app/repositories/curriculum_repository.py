from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
import uuid

from app.models.subject import Subject
from app.models.chapter import Chapter

class CurriculumRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_subject_by_id(self, subject_id: uuid.UUID) -> Optional[Subject]:
        result = await self.session.execute(select(Subject).filter(Subject.id == subject_id))
        return result.scalars().first()

    async def get_subjects_by_student_id(self, student_id: uuid.UUID) -> List[Subject]:
        result = await self.session.execute(select(Subject).filter(Subject.student_id == student_id))
        return result.scalars().all()

    async def create_subject(self, subject: Subject) -> Subject:
        self.session.add(subject)
        await self.session.flush()
        return subject

    async def get_chapter_by_id(self, chapter_id: uuid.UUID) -> Optional[Chapter]:
        result = await self.session.execute(select(Chapter).filter(Chapter.id == chapter_id))
        return result.scalars().first()

    async def get_chapters_by_subject_id(self, subject_id: uuid.UUID) -> List[Chapter]:
        result = await self.session.execute(select(Chapter).filter(Chapter.subject_id == subject_id).order_by(Chapter.order_index))
        return result.scalars().all()

    async def create_chapter(self, chapter: Chapter) -> Chapter:
        self.session.add(chapter)
        await self.session.flush()
        return chapter

    async def save_chapters(self, chapters: List[Chapter]) -> List[Chapter]:
        self.session.add_all(chapters)
        await self.session.flush()
        return chapters

    async def update_chapter(self, chapter: Chapter) -> Chapter:
        merged = await self.session.merge(chapter)
        await self.session.flush()
        return merged
