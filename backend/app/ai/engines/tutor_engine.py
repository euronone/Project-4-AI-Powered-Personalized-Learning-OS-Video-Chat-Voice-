import logging
from typing import List
from app.ai.engines.base import BaseAIEngine
from app.ai.prompts.tutor_prompts import build_tutor_prompt
from app.ai.rag.retriever import KnowledgeRetriever

logger = logging.getLogger(__name__)

class TutorEngine(BaseAIEngine):
    """
    Engine responsible for conversational tutoring.
    Powers the /api/lessons/{chapter_id}/chat endpoint using Socratic method.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.retriever = KnowledgeRetriever()

    async def generate_response(self, student_message: str, chat_history: List[str], chapter_content: str) -> str:
        """
        Generates a text response applying the built prompt context.
        """
        logger.info("Retrieving knowledge context from RAG...")
        retrieved_context = ""
        try:
            # Fallback wrapper over retriever to catch DB/connectivity errors
            retrieved_chunks = await self.retriever.retrieve_context(student_message)
            if retrieved_chunks:
                retrieved_context = "\n".join(
                    [f"- {chunk}" for chunk in retrieved_chunks]
                )
        except Exception as e:
            logger.warning(f"RAG retrieval failed, falling back to no context: {e}")

        logger.info("Building Socratic prompt for TutorEngine...")
        final_prompt = build_tutor_prompt(
            student_message=student_message,
            chat_history=chat_history,
            chapter_content=chapter_content,
            retrieved_context=retrieved_context
        )
        
        logger.info("Executing text generation via LLMRouter...")
        try:
            response = await self.llm_router.generate_text(
                prompt=final_prompt,
                task_type="tutor"
            )
            return response
        except Exception as e:
            logger.error(f"Error during text generation in TutorEngine: {str(e)}")
            return "I encountered an error trying to process that. Could you ask me again?"
