"""
Base AI Engine Module.
"""
from abc import ABC
from app.ai.clients.llm_router import LLMRouter

class BaseAIEngine(ABC):
    """
    Base class for all AI engines containing shared logic and holding an LLM router.
    """
    def __init__(self, llm_router: LLMRouter) -> None:
        self.llm_router = llm_router
