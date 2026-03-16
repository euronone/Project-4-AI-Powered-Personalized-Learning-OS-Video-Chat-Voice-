from pydantic import BaseModel


class VoiceSessionResponse(BaseModel):
    session_id: str
    client_secret: str
    model: str
    voice: str
