import logging
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.clients.llm_router import LLMRouter
from app.ai.engines.sentiment_engine import SentimentEngine
from app.pipelines.sentiment_pipeline import SentimentPipeline

logger = logging.getLogger(__name__)

async def analyze_frame(
    frame_base64: str,
    student_id: Optional[uuid.UUID] = None,
    chapter_id: Optional[uuid.UUID] = None,
    session: Optional[AsyncSession] = None,
) -> dict:
    """Analyze a video frame for student sentiment using AI."""
    try:
        if session and student_id and chapter_id:
            pipeline = SentimentPipeline(session)
            result = await pipeline.analyze_frame_and_store(
                student_id=student_id,
                chapter_id=chapter_id,
                image_base64=frame_base64
            )
            return result
            
        router = LLMRouter()
        engine = SentimentEngine(llm_router=router)

        result = await engine.analyze_frame(frame_base64=frame_base64)
        return result
    except Exception as e:
        logger.error(f"Error in sentiment analysis: {str(e)}")
        # Safe fallback response
        return {
            "emotion": "neutral",
            "confidence": 0.0,
            "action_taken": None
        }
def determine_adaptive_action(emotion: str, confidence: float) -> str | None:
    """Determine what adaptive action to take based on detected sentiment."""
    if confidence < 0.6:
        return None
    actions = {
        "bored": "Simplify content and add interactive elements. Consider suggesting a break.",
        "confused": "Slow down and re-explain with different examples and analogies.",
        "frustrated": "Offer encouragement and break the problem into smaller steps.",
        "drowsy": "Suggest a physical activity break or switch to interactive mode.",
    }
    return actions.get(emotion)
