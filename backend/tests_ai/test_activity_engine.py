import asyncio
import os
import sys

# Ensure backend imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ai.clients.llm_router import LLMRouter
from app.ai.engines.activity_generation_engine import ActivityGenerationEngine

async def run_test():
    print("--- Testing ActivityGenerationEngine ---")
    try:
        router = LLMRouter()
        engine = ActivityGenerationEngine(llm_router=router)
        response = await engine.generate_activities(
            chapter_title="Gravity",
            chapter_content="Gravity pulls objects toward Earth",
            difficulty="medium",
            student_level="grade 8"
        )
        print("Structured activities received:")
        print(response)
    except Exception as e:
        print(f"Error test_activity_engine: {e}")

if __name__ == "__main__":
    asyncio.run(run_test())
