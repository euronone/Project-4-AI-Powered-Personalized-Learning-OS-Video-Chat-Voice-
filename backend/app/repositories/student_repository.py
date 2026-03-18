from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
import uuid

from app.models.student import Student

class StudentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_student_by_id(self, student_id: uuid.UUID) -> Optional[Student]:
        result = await self.session.execute(select(Student).filter(Student.id == student_id))
        return result.scalars().first()

    async def get_all_students(self) -> List[Student]:
        result = await self.session.execute(select(Student))
        return result.scalars().all()

    async def create_student(self, student: Student) -> Student:
        self.session.add(student)
        await self.session.flush()
        return student

    async def update_student(self, student: Student) -> Student:
        await self.session.merge(student)
        await self.session.flush()
        return student
