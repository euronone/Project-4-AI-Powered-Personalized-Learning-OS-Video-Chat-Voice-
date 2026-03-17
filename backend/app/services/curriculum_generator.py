import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from app.ai.clients.llm_router import LLMRouter
from app.ai.engines.curriculum_engine import CurriculumEngine
from app.pipelines.curriculum_pipeline import CurriculumPipeline

logger = logging.getLogger(__name__)

async def generate_curriculum(
    subject_name: str,
    grade: str,
    background: str | None,
    difficulty_level: str,
    student_id: Optional[uuid.UUID] = None,
    session: Optional[AsyncSession] = None,
) -> dict:
    """Generate a full curriculum for a subject using AI and save via Pipeline."""
    try:
        if session and student_id:
            pipeline = CurriculumPipeline(session)
            result = await pipeline.generate_and_save_subject(
                student_id=student_id,
                subject_name=subject_name,
                grade=grade,
                background=background or ""
            )
            return result

        # Fallback to direct engine call if no DB session provided
        router = LLMRouter()
        engine = CurriculumEngine(llm_router=router)

        student_profile = {
            "grade": grade,
            "background": background,
            "goals": f"Learn {subject_name} at {difficulty_level} level"
        }
        result = await engine.generate_subject_curriculum(
            student_profile=student_profile,
            subject_name=subject_name
        )
        return result
    except Exception as e:
        # Fallback curriculum
        return {
            "subject_name": subject_name,
            "difficulty_level": difficulty_level,
            "summary": "Fallback curriculum generated due to AI service unavailability.",
            "chapters": [
                {
                    "title": f"Introduction to {subject_name}",
                    "description": "Basic overview and fundamental concepts.",
                    "order_index": 1,
                    "learning_objectives": ["Understand the basics"]
                }
            ]
        }

async def generate_chapter_content(
    chapter_title: str,
    chapter_description: str,
    subject_name: str,
    grade: str,
    student_background: str | None,
) -> dict:
    """Generate detailed content for a single chapter."""
    try:
        router = LLMRouter()
        engine = CurriculumEngine(llm_router=router)
        # Using generate_text since CurriculumEngine.generate_chapter_content might not be fully implemented
        prompt = (
            f"Write detailed educational content for a chapter titled '{chapter_title}' "
            f"about '{chapter_description}' for a {grade} student."
        )
        response = await router.generate_text(prompt=prompt, task_type="content_creation")
        return {"title": chapter_title, "content": response}
    except Exception:
        return {"title": chapter_title, "content": "Content generation pending or unavailable."}
