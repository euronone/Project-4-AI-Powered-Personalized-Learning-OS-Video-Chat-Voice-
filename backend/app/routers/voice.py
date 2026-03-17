from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user
from app.schemas.voice import VoiceSessionResponse
from app.services.voice_manager import create_realtime_session

router = APIRouter()


@router.post("/session", response_model=VoiceSessionResponse)
async def create_voice_session(user: dict = Depends(get_current_user)):
    """Create an OpenAI Realtime ephemeral session token.

    The browser uses the returned client_secret to open a WebSocket
    directly to OpenAI Realtime — the backend is not in the audio path.
    Token expires ~60 seconds after creation.
    """
    try:
        session = await create_realtime_session()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not create voice session. Please try again.",
        )

    # OpenAI returns the secret nested under client_secret.value
    client_secret = session.get("client_secret", {})
    if isinstance(client_secret, dict):
        secret_value = client_secret.get("value", "")
    else:
        secret_value = str(client_secret)

    return VoiceSessionResponse(
        session_id=session.get("id", ""),
        client_secret=secret_value,
        model=session.get("model", ""),
        voice=session.get("voice", ""),
    )

