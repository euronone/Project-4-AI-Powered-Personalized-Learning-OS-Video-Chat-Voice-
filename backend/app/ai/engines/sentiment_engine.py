import logging
from typing import Any, Dict, Literal
from pydantic import BaseModel, Field
from app.ai.engines.base import BaseAIEngine
logger = logging.getLogger(__name__)
class SentimentResponse(BaseModel):
    """
    Structured output schema for video frame sentiment analysis.
    """
    emotion: Literal["engaged", "confused", "bored", "frustrated", "happy", "drowsy", "neutral"] = Field(
        ..., description="The primary emotion or engagement state detected in the student's face."
    )
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Confidence score for the detected state (0.0 to 1.0)."
    )
class SentimentEngine(BaseAIEngine):
    """
    Engine responsible for visual sentiment analysis from video frames.
    Optimized for low latency and lightweight processing.
    """
    async def analyze_frame(self, frame_base64: str) -> Dict[str, Any]:
        """
        Analyze a single video frame and return sentiment indicators and confidence.
        Does not store image data to maintain strict privacy.
        """
        logger.debug("Executing fast frame sentiment classification...")
        prompt = (
            "Analyze the provided image frame of a student learning. "
            "Determine their primary cognitive/affective state from these options: "
            "engaged, confused, bored, frustrated, happy, drowsy, or neutral. "
            "Return the detected state and your confidence score (0.0 - 1.0). "
            "Focus primarily on facial expression and eye focus."
        )
        try:
            result_model = await self.llm_router.generate_structured(
                prompt=prompt,
                response_model=SentimentResponse,
                image_base64=frame_base64,
                task_type="sentiment",
                temperature=0.0,  # Important: force low temperature for low latency & predictable behavior
                max_tokens=20     # Important: limit tokens to speed up response time dramatically
            )
            return result_model.model_dump()
        except Exception as e:
            logger.error(f"Failed to analyze frame sentiment: {str(e)}")
            # Fail-safe default to prevent interruption of video stream analytics
            return {
                "emotion": "neutral",
                "confidence": 0.0
            }
