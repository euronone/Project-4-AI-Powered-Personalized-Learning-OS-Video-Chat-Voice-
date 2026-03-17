import logging
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Optional
import uuid

from app.models.sentiment_log import SentimentLog, Emotion
from app.repositories.sentiment_repository import SentimentRepository
from app.ai.engines.sentiment_engine import SentimentEngine

logger = logging.getLogger(__name__)

class SentimentPipeline:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.sentiment_repo = SentimentRepository(session)
        self.engine = SentimentEngine()

    async def analyze_frame_and_store(
        self, 
        student_id: uuid.UUID, 
        chapter_id: uuid.UUID, 
        image_base64: str
    ) -> Dict[str, Any]:
        """
        1. Analyze frame
        2. Store sentiment_log
        3. Update student state (simplified, handled by returning actionable insights)
        """
        try:
            # 1. Analyze frame via AI
            analysis_result = await self.engine.analyze_frame(image_base64)
            
            emotion_str = analysis_result.get("emotion", "engaged")
            try:
                emotion_enum = Emotion(emotion_str)
            except ValueError:
                emotion_enum = Emotion.engaged
                
            confidence = analysis_result.get("confidence", 0.8)
            action_taken = analysis_result.get("suggested_action", None)
            
            # 2. Store to DB
            log_entry = SentimentLog(
                id=uuid.uuid4(),
                student_id=student_id,
                chapter_id=chapter_id,
                emotion=emotion_enum,
                confidence=confidence,
                action_taken=action_taken
            )
            
            await self.sentiment_repo.save_sentiment_log(log_entry)
            await self.session.commit()
            
            return {
                "status": "success",
                "log_id": str(log_entry.id),
                "emotion": emotion_enum.value,
                "confidence": confidence,
                "action": action_taken
            }
        except Exception as e:
            await self.session.rollback()
            logger.error(f"Sentiment pipeline failed: {str(e)}")
            return {
                "status": "error",
                "message": str(e),
                # fallback values
                "emotion": "engaged",
                "confidence": 1.0,
                "action": None
            }
