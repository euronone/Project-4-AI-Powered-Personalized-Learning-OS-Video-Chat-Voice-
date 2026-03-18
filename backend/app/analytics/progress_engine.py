import logging
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Dict, Any, List

from app.repositories.progress_repository import ProgressRepository
from app.repositories.curriculum_repository import CurriculumRepository
from app.repositories.activity_repository import ActivityRepository

logger = logging.getLogger(__name__)

class ProgressEngine:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.progress_repo = ProgressRepository(session)
        self.curriculum_repo = CurriculumRepository(session)
        self.activity_repo = ActivityRepository(session)

    async def calculate_subject_progress(self, student_id: uuid.UUID, subject_id: uuid.UUID) -> Dict[str, Any]:
        """
        Calculate completion %, average score, and chapter progress for a specific subject
        """
        try:
            chapters = await self.curriculum_repo.get_chapters_by_subject_id(subject_id)
            total_chapters = len(chapters)
            
            if total_chapters == 0:
                return {
                    "completion_percentage": 0,
                    "completed_chapters": 0,
                    "total_chapters": 0,
                    "average_score": 0
                }

            completed_chapters = sum(1 for c in chapters if c.status.value == "completed")
            completion_percentage = (completed_chapters / total_chapters) * 100

            # Get all activity submissions for these chapters to calculate average score
            total_score = 0
            total_submissions = 0
            for chapter in chapters:
                submissions = await self.activity_repo.get_submissions_by_student_and_chapter(student_id, chapter.id)
                for sub in submissions:
                    total_score += sub.score
                    total_submissions += 1

            average_score = (total_score / total_submissions) if total_submissions > 0 else 0

            return {
                "completion_percentage": round(completion_percentage, 2),
                "completed_chapters": completed_chapters,
                "total_chapters": total_chapters,
                "average_score": round(average_score, 2),
                "chapter_progress": [
                    {
                        "chapter_id": str(c.id),
                        "title": c.title,
                        "status": c.status.value
                    } for c in chapters
                ]
            }
        except Exception as e:
            logger.error(f"Failed to calculate progress: {str(e)}")
            return {
                "completion_percentage": 0,
                "completed_chapters": 0,
                "total_chapters": 0,
                "average_score": 0,
                "error": str(e)
            }
