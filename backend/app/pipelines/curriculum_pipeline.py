import logging
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
import uuid

from app.models.subject import Subject, SubjectStatus, SubjectDifficulty
from app.models.chapter import Chapter, ChapterStatus
from app.repositories.curriculum_repository import CurriculumRepository
from app.ai.engines.curriculum_engine import CurriculumEngine

logger = logging.getLogger(__name__)

class CurriculumPipeline:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.curriculum_repo = CurriculumRepository(session)
        self.engine = CurriculumEngine()

    async def generate_and_save_subject(
        self, 
        student_id: uuid.UUID, 
        subject_name: str, 
        grade: str, 
        background: str
    ) -> Dict[str, Any]:
        """
        1. Call CurriculumEngine
        2. Parse chapters
        3. Save to DB
        """
        try:
            # 1. Generate curriculum
            profile_data = {
                "grade": grade,
                "background": background,
                "interests": [subject_name]
            }
            curriculum_plan = await self.engine.generate_curriculum(subject_name, profile_data)
            
            # 2. Save Subject
            subject = Subject(
                id=uuid.uuid4(),
                student_id=student_id,
                name=subject_name,
                status=SubjectStatus.not_started,
                difficulty_level=SubjectDifficulty.intermediate  # Default or derived
            )
            await self.curriculum_repo.create_subject(subject)
            
            # 3. Parse and save chapters
            saved_chapters = []
            if isinstance(curriculum_plan, dict) and "chapters" in curriculum_plan:
                chapters_data = curriculum_plan["chapters"]
            else:
                chapters_data = curriculum_plan if isinstance(curriculum_plan, list) else []
                
            for idx, chap_meta in enumerate(chapters_data):
                chapter = Chapter(
                    id=uuid.uuid4(),
                    subject_id=subject.id,
                    order_index=idx,
                    title=chap_meta.get("title", f"Chapter {idx+1}"),
                    description=chap_meta.get("description", ""),
                    status=ChapterStatus.available if idx == 0 else ChapterStatus.locked,
                    content_json={"overview": chap_meta.get("learning_objectives", [])}
                )
                await self.curriculum_repo.create_chapter(chapter)
                saved_chapters.append(chapter)
            
            await self.session.commit()
            
            return {
                "subject_id": str(subject.id),
                "name": subject.name,
                "chapters_count": len(saved_chapters)
            }
        except Exception as e:
            await self.session.rollback()
            logger.error(f"Curriculum pipeline failed for {subject_name}: {str(e)}")
            raise e
