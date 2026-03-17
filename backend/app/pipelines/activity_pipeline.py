import logging
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
import uuid

from app.models.activity import Activity, ActivityType, ActivityStatus, ActivitySubmission
from app.repositories.activity_repository import ActivityRepository
from app.repositories.curriculum_repository import CurriculumRepository
from app.ai.engines.activity_generation_engine import ActivityGenerationEngine
from app.ai.engines.activity_evaluation_engine import ActivityEvaluationEngine

logger = logging.getLogger(__name__)

class ActivityPipeline:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.activity_repo = ActivityRepository(session)
        self.curriculum_repo = CurriculumRepository(session)
        self.generation_engine = ActivityGenerationEngine()
        self.evaluation_engine = ActivityEvaluationEngine()

    async def generate_and_save_activities(self, chapter_id: uuid.UUID) -> List[Dict[str, Any]]:
        """
        1. Generate activities using AI
        2. Save activities to DB
        """
        try:
            chapter = await self.curriculum_repo.get_chapter_by_id(chapter_id)
            if not chapter:
                raise ValueError("Chapter not found")
                
            # Assume chapter has content_json that AI can use
            chapter_content = chapter.content_json
            
            # Use generation engine (pseudo-interface)
            # engine could take chapter_title and chapter_content
            activities_data = await self.generation_engine.generate_activities(
                chapter_title=chapter.title,
                chapter_content=str(chapter_content)
            )
            
            saved_instances = []
            for act_data in activities_data.get("activities", []):
                act = Activity(
                    id=uuid.uuid4(),
                    chapter_id=chapter_id,
                    type=ActivityType(act_data.get("type", "quiz")),
                    prompt_json=act_data,
                    status=ActivityStatus.pending
                )
                await self.activity_repo.create_activity(act)
                saved_instances.append(act)
                
            await self.session.commit()
            
            return [{"id": str(a.id), "type": a.type.value} for a in saved_instances]
        except Exception as e:
            await self.session.rollback()
            logger.error(f"Activity generation pipeline failed: {str(e)}")
            raise e

    async def evaluate_and_store_submission(self, activity_id: uuid.UUID, student_id: uuid.UUID, response_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        1. Process submission
        2. Evaluate using AI
        3. Store result
        """
        try:
            activity = await self.activity_repo.get_activity_by_id(activity_id)
            if not activity:
                raise ValueError("Activity not found")
                
            activity.status = ActivityStatus.submitted
            await self.session.flush()
            
            # Evaluate using AI
            evaluation_result = await self.evaluation_engine.evaluate(
                activity_prompt=activity.prompt_json,
                student_response=response_data
            )
            
            # Save submission
            submission = ActivitySubmission(
                id=uuid.uuid4(),
                activity_id=activity_id,
                student_id=student_id,
                response_json=response_data,
                evaluation_json=evaluation_result.get("feedback", {}),
                score=evaluation_result.get("score", 0)
            )
            await self.activity_repo.save_activity_submission(submission)
            
            activity.status = ActivityStatus.evaluated
            await self.session.commit()
            
            return {
                "submission_id": str(submission.id),
                "score": submission.score,
                "feedback": submission.evaluation_json
            }
        except Exception as e:
            await self.session.rollback()
            logger.error(f"Activity evaluation pipeline failed: {str(e)}")
            raise e
