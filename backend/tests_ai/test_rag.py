import asyncio
import os
import sys

# Ensure backend imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ai.rag.retriever import KnowledgeRetriever

async def run_test():
    print("--- Testing RAG Retriever ---")
    try:
        retriever = KnowledgeRetriever()
        chunks = await retriever.retrieve_context("gravity", top_k=3)
        if not chunks:
            print("No chunks retrieved or fallback activated (empty list returned).")
        else:
            print(f"Retrieved {len(chunks)} chunks:")
            for i, chunk in enumerate(chunks, 1):
                print(f"[{i}]: {chunk}")
    except Exception as e:
        print(f"Error test_rag: {e}")

if __name__ == "__main__":
    asyncio.run(run_test())
