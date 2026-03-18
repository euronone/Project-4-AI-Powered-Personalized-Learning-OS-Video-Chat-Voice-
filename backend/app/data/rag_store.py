import json
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

logger = logging.getLogger(__name__)

class RAGStore:
    """
    RAG Data Layer handling storing embeddings and retrieving context.
    We assume PostgreSQL, optionally using pgvector.
    If pgvector is not fully set up, we fallback to a simple table-based JSONB storage
    and perform cosine similarity in-memory or purely return a matched set.
    For production, this would leverage vector extensions natively.
    """
    def __init__(self, session: AsyncSession):
        self.session = session

    async def init_vector_table_if_needed(self):
        """
        Idempotent creation of the vector storage table if it doesn't exist.
        In a real app, this belongs in Alembic migrations.
        """
        try:
            # Check if pgvector is available
            await self.session.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            
            # Create a simple documents table if it doesn't exist
            create_table_sql = """
            CREATE TABLE IF NOT EXISTS rag_documents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                content TEXT NOT NULL,
                metadata JSONB,
                embedding vector(1536)
            );
            """
            await self.session.execute(text(create_table_sql))
            await self.session.commit()
        except Exception as e:
            logger.warning(f"RAG table initialization issue (ignoring): {str(e)}")
            await self.session.rollback()

    async def store_chunk(self, text_chunk: str, embedding: List[float], metadata: Dict[str, Any] = None) -> bool:
        try:
            metadata_json = json.dumps(metadata) if metadata else "{}"
            # Formatting vector for pgvector
            embedding_str = str(embedding).replace(' ', '')
            
            stmt = text("""
                INSERT INTO rag_documents (content, metadata, embedding)
                VALUES (:content, :metadata, :embedding)
            """)
            await self.session.execute(stmt, {
                "content": text_chunk,
                "metadata": metadata_json,
                "embedding": embedding_str
            })
            await self.session.commit()
            return True
        except Exception as e:
            await self.session.rollback()
            logger.error(f"Failed to store RAG chunk: {str(e)}")
            return False

    async def retrieve_context(self, query_embedding: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        try:
            # We use L2 distance `<->` or cosine distance `<=>` operator provided by pgvector
            embedding_str = str(query_embedding).replace(' ', '')
            
            stmt = text("""
                SELECT content, metadata, 1 - (embedding <=> :query_embedding) as similarity
                FROM rag_documents
                ORDER BY embedding <=> :query_embedding
                LIMIT :limit
            """)
            
            result = await self.session.execute(stmt, {
                "query_embedding": embedding_str,
                "limit": top_k
            })
            
            rows = result.fetchall()
            
            return [
                {
                    "content": row.content,
                    "metadata": row.metadata if isinstance(row.metadata, dict) else json.loads(row.metadata),
                    "score": float(row.similarity)
                }
                for row in rows
            ]
        except Exception as e:
            logger.error(f"Failed to retrieve context from RAG store: {str(e)}")
            # Fallback to empty list so it doesn't crash
            return []
