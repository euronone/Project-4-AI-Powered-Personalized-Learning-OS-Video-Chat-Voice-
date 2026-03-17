import logging
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.clients.llm_router import LLMRouter
from app.ai.engines.activity_evaluation_engine import ActivityEvaluationEngine
from app.ai.engines.activity_generation_engine import ActivityGenerationEngine
from app.pipelines.activity_pipeline import ActivityPipeline

logger = logging.getLogger(__name__)

async def generate_activities(
    chapter_title: str,
    chapter_content: str,
    student_grade: str,
    difficulty: str = "intermediate",
    chapter_id: Optional[uuid.UUID] = None,
    session: Optional[AsyncSession] = None,
) -> dict:
    """Generate multiple learning activities for a chapter."""
    try:
        if session and chapter_id:
            pipeline = ActivityPipeline(session)
            activities = await pipeline.generate_and_save_activities(chapter_id)
            return {"activities": activities}
            
        router = LLMRouter()
        engine = ActivityGenerationEngine(llm_router=router)
        result = await engine.generate_activities(
            chapter_title=chapter_title,
            chapter_content=chapter_content,
            difficulty=difficulty,
            student_level=f"Grade {student_grade}"
        )
        return result
    except Exception as e:
        logger.error(f"Error generation activities: {str(e)}")
        return {"activities": []}

async def evaluate_submission(
    activity_prompt: dict,
    student_response: dict,
    student_grade: str,
    activity_id: Optional[uuid.UUID] = None,
    student_id: Optional[uuid.UUID] = None,
    session: Optional[AsyncSession] = None,
) -> dict:
    """Evaluate a student's activity submission using AI."""
    try:
        if session and activity_id and student_id:
            pipeline = ActivityPipeline(session)
            result = await pipeline.evaluate_and_store_submission(
                activity_id=activity_id,
                student_id=student_id,
                response_data=student_response
            )
            return result

        router = LLMRouter()
        engine = ActivityEvaluationEngine(llm_router=router)
        question = activity_prompt.get("question", str(activity_prompt))
        correct_answer = activity_prompt.get("correct_answer", "")
        student_answer = student_response.get("answer", str(student_response))
        result = await engine.evaluate_submission(
            question=question,
            correct_answer=correct_answer,
            student_answer=student_answer
        )
        return result
    except Exception as e:
        logger.error(f"Error evaluating submission: {str(e)}")
        return {
            "is_correct": False,
            "score": 0,
            "feedback": "Evaluation is temporarily unavailable. Please try again later.",
            "concepts_to_review": []
        }
