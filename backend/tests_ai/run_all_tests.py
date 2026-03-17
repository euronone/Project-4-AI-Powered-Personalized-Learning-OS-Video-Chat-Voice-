import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from test_llm_router import run_test as run_llm_router
from test_tutor_engine import run_test as run_tutor_engine
from test_rag import run_test as run_rag
from test_activity_engine import run_test as run_activity_engine

async def main():
    print("===============================")
    print("STARTING AI SUBSYSTEM TESTS")
    print("===============================\n")

    try:
        await run_llm_router()
    except Exception as e:
        print(f"FAILED: LLMRouter -> {e}")
    print("\n-------------------------------\n")

    try:
        await run_tutor_engine()
    except Exception as e:
        print(f"FAILED: TutorEngine -> {e}")
    print("\n-------------------------------\n")

    try:
        await run_rag()
    except Exception as e:
        print(f"FAILED: RAG -> {e}")
    print("\n-------------------------------\n")

    try:
        await run_activity_engine()
    except Exception as e:
        print(f"FAILED: ActivityEngine -> {e}")
    
    print("\n===============================")
    print("ALL TESTS COMPLETED")
    print("===============================")

if __name__ == "__main__":
    asyncio.run(main())
