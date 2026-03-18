import logging
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
import uuid

from app.models.student import Student
from app.repositories.student_repository import StudentRepository
from app.repositories.curriculum_repository import CurriculumRepository
from app.pipelines.curriculum_pipeline import CurriculumPipeline

logger = logging.getLogger(__name__)

class OnboardingPipeline:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.student_repo = StudentRepository(session)
        self.curriculum_repo = CurriculumRepository(session)
        self.curriculum_pipeline = CurriculumPipeline(session)

    async def run(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        1. Save student profile
        2. Trigger curriculum generation
        3. Store subjects + chapters
        """
        try:
            student_id = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
            
            # 1. Update or create student profile
            student = await self.student_repo.get_student_by_id(student_id)
            if not student:
                student = Student(id=student_id)
                await self.student_repo.create_student(student)
            
            student.grade = profile_data.get("grade")
            student.background = profile_data.get("background")
            student.interests = profile_data.get("interests", [])
            student.onboarding_completed = True
            
            await self.student_repo.update_student(student)
            
            # 2. Trigger curriculum generation for interests
            generated_subjects = []
            if student.interests:
                for subject_name in student.interests:
                    try:
                        subject_data = await self.curriculum_pipeline.generate_and_save_subject(
                            student_id=student_id,
                            subject_name=subject_name,
                            grade=student.grade,
                            background=student.background
                        )
                        generated_subjects.append(subject_data)
                    except Exception as e:
                        logger.error(f"Failed to generate curriculum for subject {subject_name}: {str(e)}")
            
            # Commit all changes
            await self.session.commit()
            
            return {
                "status": "success",
                "student_id": str(student_id),
                "subjects": generated_subjects
            }
        except Exception as e:
            await self.session.rollback()
            logger.error(f"Onboarding pipeline failed: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
