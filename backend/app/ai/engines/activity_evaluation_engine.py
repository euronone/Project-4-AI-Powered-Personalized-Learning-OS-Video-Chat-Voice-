import logging
from typing import Any, Dict
from pydantic import BaseModel, Field
from app.ai.engines.base import BaseAIEngine
logger = logging.getLogger(__name__)
class ActivityEvaluationResponse(BaseModel):
    """
    Structured output schema for AI activity evaluations.
    """
    score: int = Field(..., ge=0, le=100, description="Score from 0 to 100 based on correctness.")
    is_correct: bool = Field(..., description="True if the response is fully or mostly correct.")
    feedback: str = Field(..., description="Detailed explanation of mistakes and guidance for improvement. Constructive tone.")
class ActivityEvaluationEngine(BaseAIEngine):
    """
    Engine responsible for generating and evaluating activities.
    """
    def build_evaluation_prompt(self, question: str, correct_answer: str, student_answer: str) -> str:
        """
        Builds the context prompt for evaluating a student submission.
        """
        system_rules = (
            "You are an expert AI teacher grading a student's activity submission.\n"
            "CRITICAL RULES:\n"
            "1. Evaluate the student response against the activity question and correct answer.\n"
            "2. Determine a score (0-100) and if the answer is completely correct or correct enough (is_correct).\n"
            "3. Provide constructive feedback. Explicitly explain mistakes clearly without being overly critical.\n"
            "4. Guide improvement. If they are wrong, point them in the right direction to learn the concept.\n"
            "5. You MUST return strictly formatted JSON mapping to the requested schema layout.\n"
        )
        full_prompt = (
            f"{system_rules}\n\n"
            f"--- ACTIVITY QUESTION ---\n"
            f"{question}\n"
            f"---------------------------\n\n"
            f"--- EXPECTED CORRECT ANSWER ---\n"
            f"{correct_answer}\n"
            f"---------------------------\n\n"
            f"--- STUDENT RESPONSE ---\n"
            f"{student_answer}\n"
            f"------------------------\n"
        )
        return full_prompt
    async def evaluate_submission(self, question: str, correct_answer: str, student_answer: str) -> Dict[str, Any]:
        """
        Assess student response for correctness, provide feedback, and determine a score (0-100).
        Returns a structured evaluation report dictionary based on a Pydantic Model.
        """
        logger.info("Building evaluation prompt for ActivityEvaluationEngine...")
        prompt = self.build_evaluation_prompt(
            question=question, 
            correct_answer=correct_answer, 
            student_answer=student_answer
        )
        logger.info("Executing structured evaluation via LLMRouter...")
        try:
            result_model = await self.llm_router.generate_structured(
                prompt=prompt,
                response_model=ActivityEvaluationResponse,
                task_type="eval"
            )
            return result_model.model_dump()
        except Exception as e:
            logger.error(f"Failed to evaluate submission: {str(e)}")
            # Fallback error dictionary
            return {
                "score": 0,
                "is_correct": False,
                "feedback": "I experienced an error while evaluating your submission. Please try again."
            }
