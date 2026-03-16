from pydantic import BaseModel


class ChapterSummary(BaseModel):
    id: str | None = None
    order_index: int
    title: str
    description: str
    status: str = "locked"
    learning_objectives: list[str] = []


class CurriculumGenerateRequest(BaseModel):
    subject_name: str
    grade: str
    background: str | None = None
    difficulty_level: str = "beginner"


class CurriculumResponse(BaseModel):
    subject_id: str
    subject_name: str
    chapters: list[ChapterSummary]
