from pydantic import BaseModel, Field


class ActivitySubmitRequest(BaseModel):
    responses: dict


class ActivityEvaluationResponse(BaseModel):
    activity_id: str
    score: int
    correctness: dict
    feedback: str
    guidance: str


class ActivityDetail(BaseModel):
    id: str
    chapter_id: str
    type: str
    status: str
    prompt: dict | None = None


class ActivityGenerateResponse(BaseModel):
    chapter_id: str
    activities_created: int
