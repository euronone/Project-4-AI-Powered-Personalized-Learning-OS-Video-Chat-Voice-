import os
import logging
from typing import List
import httpx

logger = logging.getLogger(__name__)

class VectorEmbedder:
    """
    Handles text embedding generation for retrieval augmented generation (RAG).
    Uses Euron's embedding models with simple fallbacks on missing keys or errors.
    """
    def __init__(self):
        from app.config import settings
        self.model = "euron-embedding"
        self.api_key = settings.euron_api_key
        self.api_url = "https://api.euron.one/api/v1/euri/embeddings"
        
        self.mode = os.getenv("LLM_MODE", "real").lower()
        if self.mode == "mock":
            logger.info("Running embedder in MOCK mode")
        elif not self.api_key:
            logger.warning("API_KEY not found. VectorEmbedder will use a mock fallback.")

    async def embed_text(self, text: str) -> List[float]:
        """
        Embeds a single string into a vector utilizing HTTPX async API calls.
        """
        if getattr(self, "mode", "real") == "mock" or not self.api_key:
            logger.info("Mock mode or missing API key: using mock embedding for text.")
            return [0.1] * 1536

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "input": text
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.api_url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                embedding = data["data"][0]["embedding"]
                logger.info("Successfully generated single embedding via Euron.")
                return embedding
        except Exception as e:
            logger.error(f"Error generating single embedding: {str(e)}. Using fallback.")
            return [0.1] * 1536

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Efficiently embeds a batch array of texts.
        """
        if not texts:
            return []
            
        if getattr(self, "mode", "real") == "mock" or not self.api_key:
            logger.info(f"Mock mode or missing API key: using mock embeddings for {len(texts)} items.")
            return [[0.1] * 1536 for _ in texts]
            
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "input": texts
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.api_url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                
                embeddings = [item["embedding"] for item in data.get("data", [])]
                
                if len(embeddings) != len(texts):
                    logger.warning(f"Mismatch in embedding lengths: got {len(embeddings)}, expected {len(texts)}.")
                    raise ValueError("Mismatch in embedding lengths.")
                
                logger.info(f"Successfully generated embeddings for {len(texts)} chunks via Euron.")
                return embeddings
        except Exception as e:
            logger.error(f"Error generating batch embeddings: {str(e)}. Using fallback.")
            return [[0.1] * 1536 for _ in texts]
