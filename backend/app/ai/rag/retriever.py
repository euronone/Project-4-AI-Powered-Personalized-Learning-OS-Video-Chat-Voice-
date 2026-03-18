import logging
import math
from typing import List
from sqlalchemy import text

from app.ai.rag.embedder import VectorEmbedder
from app.core.database import get_db_session
logger = logging.getLogger(__name__)
class KnowledgeRetriever:
    """
    Retrieves the most semantically relevant knowledge chunks from the vector database.
    """
    def __init__(self, embedder: VectorEmbedder = None):
        self.embedder = embedder or VectorEmbedder()
    def _cosine_similarity(self, v1: List[float], v2: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors. Used for in-memory fallback.
        """
        dot_product = sum(x * y for x, y in zip(v1, v2))
        magnitude_v1 = math.sqrt(sum(x * x for x in v1))
        magnitude_v2 = math.sqrt(sum(x * x for x in v2))
        if magnitude_v1 == 0 or magnitude_v2 == 0:
            return 0.0
        return dot_product / (magnitude_v1 * magnitude_v2)
    async def retrieve_context(self, query: str, top_k: int = 3) -> List[str]:
        """
        Embeds the query and searches the vector store for the closest chunks.
        """
        logger.info(f"Retrieving context for query: '{query}' (top_k={top_k})")
        try:
            query_embedding = await self.embedder.embed_text(query)
            db_generator = get_db_session()
            session = await anext(db_generator)
            try:
                # Queries standard pgvector <=> operator for cosine similarity mapping
                query_sql = text("""
                    SELECT content 
                    FROM knowledge_chunks 
                    ORDER BY embedding <=> :embedding_str 
                    LIMIT :top_k
                """)
                
                result = await session.execute(
                    query_sql,
                    {
                        "embedding_str": str(query_embedding),
                        "top_k": top_k
                    }
                )
                rows = result.fetchall()
                if rows:
                    chunks = [row[0] for row in rows]
                    logger.info(f"Retrieved {len(chunks)} contexts chunks from DB.")
                    return chunks
            except Exception as db_e:
                logger.warning(f"Database vector retrieval failed: {str(db_e)}. Checking for in-memory fallback...")
            finally:
                await session.close()
            # If the database returns no results or fails, return an empty set.
            # Real in-memory fallback logic would require a stateful cache of chunks.
            logger.warning("No context found or vector search failed. Returning empty context.")
            return []
        except Exception as e:
            logger.error(f"Error during context retrieval: {str(e)}")
            return []
