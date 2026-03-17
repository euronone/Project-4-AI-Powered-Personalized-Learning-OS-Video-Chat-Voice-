from typing import Literal

from pydantic import BaseModel


class LessonContent(BaseModel):
    chapter_id: str
    title: str
    content_html: str
    diagrams: list[str] = []
    formulas: list[str] = []
    key_concepts: list[str] = []
    summary: str = ""


class ChapterStatusUpdate(BaseModel):
    status: Literal["in_progress", "completed"]


class ChatRequest(BaseModel):
    message: str
    conversation_history: list[dict] = []


class ChatMessageResponse(BaseModel):
    role: str
    content: str
