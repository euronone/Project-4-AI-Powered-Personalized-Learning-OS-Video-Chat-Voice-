from collections.abc import AsyncGenerator
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.clients.llm_router import LLMRouter
from app.ai.engines.tutor_engine import TutorEngine
from app.data.rag_store import RAGStore

logger = logging.getLogger(__name__)

async def stream_teaching_response(
    chapter_content: dict,
    student_message: str,
    conversation_history: list[dict],
    student_grade: str,
    student_background: str | None,
    session: Optional[AsyncSession] = None,
) -> AsyncGenerator[str, None]:
    """Stream a teaching response using Claude API.
    Uses Socratic method � guides rather than gives answers.
    Adapts explanation depth based on student responses.
    """
    try:
        router = LLMRouter()
        engine = TutorEngine(llm_router=router)
        chat_history_strs = [f"{msg.get('role', 'unknown')}: {msg.get('content', '')}" for msg in conversation_history]
        
        rag_context = ""
        if session:
            try:
                rag = RAGStore(session)
                # Dummy embedding query array for retrieval demonstration
                dummy_emb = [0.0] * 1536
                docs = await rag.retrieve_context(dummy_emb, top_k=3)
                if docs:
                    rag_context = "\\nAdditional Context:\\n" + "\\n".join(d['content'] for d in docs)
            except Exception as e:
                logger.warning(f"RAG retrieval failed: {e}")

        combined_content = str(chapter_content) + rag_context
        
        response = await engine.generate_response(
            student_message=student_message,
            chat_history=chat_history_strs,
            chapter_content=combined_content
        )
        yield response
    except Exception as e:
        logger.error(f"Error in teaching engine: {str(e)}")
        yield "I'm having a little trouble thinking right now. Could you please try asking your question again?"
