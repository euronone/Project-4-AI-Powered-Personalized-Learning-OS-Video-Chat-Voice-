from pydantic import BaseModel


class AuthVerifyResponse(BaseModel):
    user_id: str | None
    email: str | None
    role: str | None
    onboarding_completed: bool


class TokenVerifyResponse(BaseModel):
    user_id: str
    email: str
    role: str
