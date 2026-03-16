from pydantic import BaseModel, Field, model_validator


class ActivitySubmitRequest(BaseModel):
    responses: dict

    @model_validator(mode="before")
    @classmethod
    def normalize_legacy_response_key(cls, data):
        # Backward compatibility: accept both `response` and `responses`.
        if isinstance(data, dict) and "responses" not in data and "response" in data:
            data = {**data, "responses": data["response"]}
        return data


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
