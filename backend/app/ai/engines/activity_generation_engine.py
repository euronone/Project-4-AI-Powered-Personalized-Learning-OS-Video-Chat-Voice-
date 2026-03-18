import logging
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field
from app.ai.engines.base import BaseAIEngine
logger = logging.getLogger(__name__)
class ActivityItem(BaseModel):
    """
    Represents a single learning activity.
    Uses optional fields to flexibly support multiple activity types while maintaining a strict outer boundary.
    """
    type: Literal["mcq", "short_answer", "problem"] = Field(..., description="Type of the activity (mcq, short_answer, or problem).")
    question: str = Field(..., description="The main question or problem description.")
    options: Optional[List[str]] = Field(None, description="List of 4 options. Only required if type is 'mcq'.")
    correct_answer: Optional[str] = Field(None, description="The correct option. Only required if type is 'mcq'.")
    expected_answer: Optional[str] = Field(None, description="The expected answer. Only required if type is 'short_answer'.")
    solution: Optional[str] = Field(None, description="The detailed solution. Only required if type is 'problem'.")
    steps: Optional[List[str]] = Field(None, description="Step-by-step breakdown. Only required if type is 'problem'.")
    explanation: Optional[str] = Field(None, description="Explanation of why the answer is correct. Needed for mcq and short_answer.")
class ActivityGenerationResponse(BaseModel):
    activities: List[ActivityItem] = Field(..., description="A list of 3 to 5 generated activities.")
class ActivityGenerationEngine(BaseAIEngine):
    """
    Engine responsible for generating learning activities (MCQs, short answers, problems)
    based on a specific chapter's content.
    """
    def build_prompt(self, chapter_title: str, chapter_content: str, difficulty: str, student_level: str) -> str:
        """
        Builds the prompt to generate structured activities based on chapter context.
        """
        system_rules = (
            "You are an expert curriculum developer and instructional designer.\n"
            "CRITICAL RULES:\n"
            "1. Generate 3 to 5 activities based STRICTLY on the provided chapter content.\n"
            "2. Do not hallucinate facts or include concepts not covered in the chapter.\n"
            "3. Mix activity types (e.g., 'mcq', 'short_answer', 'problem').\n"
            f"4. Adapt the language, tone, and complexity to the student's level: '{student_level}'.\n"
            f"5. Target the requested exact difficulty level: '{difficulty}'.\n"
            "6. Ensure all questions are educationally sound, unambiguously phrased, and accurate.\n"
            "7. Return your response as a structured JSON object matching the schema.\n"
        )
        full_prompt = (
            f"{system_rules}\n\n"
            f"--- CHAPTER TITLE ---\n"
            f"{chapter_title}\n"
            f"---------------------\n\n"
            f"--- CHAPTER CONTENT ---\n"
            f"{chapter_content}\n"
            f"-----------------------\n"
        )
        return full_prompt
    async def generate_activities(self, chapter_title: str, chapter_content: str, difficulty: str, student_level: str) -> Dict[str, Any]:
        """
        Generates 3-5 learning activities based on the chapter content and student parameters.
        Returns a structured dictionary mapping to the ActivityGenerationResponse schema.
        """
        logger.info(f"Building activity generation prompt for chapter: '{chapter_title}'")
        prompt = self.build_prompt(
            chapter_title=chapter_title,
            chapter_content=chapter_content,
            difficulty=difficulty,
            student_level=student_level
        )
        logger.info("Executing structured activity generation via LLMRouter...")
        try:
            result_model = await self.llm_router.generate_structured(
                prompt=prompt,
                schema=ActivityGenerationResponse,
                task_type="activity_gen"
            )
            # Using exclude_none=True ensures that fields like 'steps' or 'options' 
            # aren't included if they are None (i.e. to perfectly match your target JSON shape)
            return result_model.model_dump(exclude_none=True)
        except Exception as e:
            logger.error(f"Failed to generate activities: {str(e)}")
            # Fallback to an empty list to prevent downstream array-mapping failures
            return {"activities": []}
