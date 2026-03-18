import asyncio
import os
import sys

# Ensure backend imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ai.clients.llm_router import LLMRouter
from app.ai.engines.tutor_engine import TutorEngine

async def run_test():
    print("--- Testing TutorEngine ---")
    try:
        router = LLMRouter()
        engine = TutorEngine(llm_router=router)
        response = await engine.generate_response(
            student_message="What is gravity?",
            chat_history=[],
            chapter_content="Gravity is a force that attracts objects towards each other."
        )
        print("Response received:")
        print(response)
    except Exception as e:
        print(f"Error test_tutor_engine: {e}")

if __name__ == "__main__":
    asyncio.run(run_test())
