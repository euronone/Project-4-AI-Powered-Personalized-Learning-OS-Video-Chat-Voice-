import asyncio
import os
import sys

# Ensure backend imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ai.clients.llm_router import LLMRouter

async def run_test():
    print("--- Testing LLMRouter ---")
    router = LLMRouter()
    try:
        response = await router.generate_text(
            prompt="Explain gravity simply",
            task_type="tutor"
        )
        print("Response received:")
        print(response)
    except Exception as e:
        print(f"Error test_llm_router: {e}")

if __name__ == "__main__":
    asyncio.run(run_test())
