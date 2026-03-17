import logging
import re
from typing import Dict, Any, List

from app.ai.rag.embedder import VectorEmbedder
from app.core.database import get_db_session

logger = logging.getLogger(__name__)

class DocumentIngestor:
    """
    Cleans, chunks, embeds, and stores long-form text elements into the active RAG vector database.
    """
    
    def __init__(self, embedder: VectorEmbedder = None, chunk_size: int = 400, overlap: int = 50):
        self.embedder = embedder or VectorEmbedder()
        self.chunk_size = chunk_size
        self.overlap = overlap

    def _clean_text(self, text: str) -> str:
        """
        Strips unnecessary whitespace and standardizes formatting.
        """
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def _chunk_text(self, text: str) -> List[str]:
        """
        Splits parsed body text into semantic chunks attempting to maintain structural sentence integrity.
        Uses ~4 chars per token approximation.
        """
        sentences = re.split(r'(?<=[.!?]) +', text)
        
        chunks = []
        current_chunk = []
        current_length = 0
        
        target_chars = self.chunk_size * 4
        overlap_target_chars = self.overlap * 4
        
        for sentence in sentences:
            sentence_len = len(sentence)
            if current_length + sentence_len > target_chars and current_chunk:
                chunks.append(" ".join(current_chunk))
                
                overlap_chars = 0
                overlap_chunk = []
                for s in reversed(current_chunk):
                    if overlap_chars + len(s) > overlap_target_chars:
                        break
                    overlap_chunk.insert(0, s)
                    overlap_chars += len(s)
                
                current_chunk = overlap_chunk + [sentence]
                current_length = sum(len(s) for s in current_chunk)
            else:
                current_chunk.append(sentence)
                current_length += sentence_len
                
        if current_chunk:
            chunks.append(" ".join(current_chunk))
            
        return chunks

    async def process_document(self, text: str, metadata: Dict[str, Any]) -> None:
        """
        Full pipeline: Clean -> Chunk -> Embed -> Database Insert.
        """
        logger.info(f"Ingesting new document with metadata: {metadata.get('title', 'Unknown')}")
        
        cleaned_text = self._clean_text(text)
        chunks = self._chunk_text(cleaned_text)
        
        if not chunks:
            logger.warning("Document produced no chunks after cleaning.")
            return

        logger.info(f"Document split into {len(chunks)} chunks. Generating embeddings...")
        
        embeddings = await self.embedder.embed_batch(chunks)
        
        logger.info("Embeddings complete. Storing knowledge_chunks into database.")
        
        try:
            db_generator = get_db_session()
            session = await anext(db_generator)
            
            try:
                for idx, chunk in enumerate(chunks):
                    # Uses parameterized sql to insert into pgvector structure
                    await session.execute(
                        """
                        INSERT INTO knowledge_chunks (content, embedding, metadata) 
                        VALUES (:content, :embedding, :metadata)
                        """,
                        {
                            "content": chunk,
                            "embedding": str(embeddings[idx]),  # Casting depending on sqlalchemy dialect
                            "metadata": metadata
                        }
                    )
                await session.commit()
                logger.info("Successfully ingested document to PostgreSQL vector store.")
            except Exception as e:
                await session.rollback()
                raise e
            finally:
                await session.close()
                
        except Exception as e:
            logger.error(f"Failed to ingest processed chunks into db: {str(e)}")
            raise e
