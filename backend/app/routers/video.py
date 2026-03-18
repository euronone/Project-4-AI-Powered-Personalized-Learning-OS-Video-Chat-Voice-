import uuid

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.core.redis_client import redis_client
from app.core.security import verify_supabase_jwt_ws
from app.dependencies import get_current_user
from app.models.chapter import Chapter
from app.models.sentiment_log import SentimentLog
from app.schemas.sentiment import SentimentRequest, SentimentResponse
from app.services.sentiment_analyzer import analyze_frame, determine_adaptive_action

router = APIRouter()


@router.post("/analyze", response_model=SentimentResponse)
async def analyze_video_frame(
    data: SentimentRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Analyze a video frame for student sentiment via Claude Vision."""
    student_id = uuid.UUID(user["sub"])

    try:
        chapter_uuid = uuid.UUID(data.chapter_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid chapter_id")

    try:
        result = await analyze_frame(data.frame_base64)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Sentiment analysis failed. Please try again.",
        )

    emotion = result["emotion"]
    confidence = result["confidence"]
    action = determine_adaptive_action(emotion, confidence)

    chapter_result = await db.execute(
        select(Chapter.id).where(Chapter.id == chapter_uuid)
    )
    if chapter_result.scalar_one_or_none() is not None:
        log = SentimentLog(
            student_id=student_id,
            chapter_id=chapter_uuid,
            emotion=emotion,
            confidence=confidence,
            action_taken=action,
        )
        db.add(log)
        await db.commit()

    # Cache latest sentiment in Redis (TTL 60s) — optional, graceful on failure
    try:
        cache_key = f"sentiment:{student_id}:{data.chapter_id}"
        await redis_client.setex(cache_key, 60, f"{emotion}:{confidence:.3f}")
    except Exception:
        pass

    return SentimentResponse(emotion=emotion, confidence=confidence, action_taken=action)


@router.websocket("/sentiment/ws")
async def sentiment_websocket(websocket: WebSocket, token: str | None = None):
    """WebSocket for streaming live sentiment updates. Auth via ?token= query param."""
    if not token:
        await websocket.close(code=1008)
        return

    payload = verify_supabase_jwt_ws(token)
    if payload is None:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    try:
        while True:
            frame_data = await websocket.receive_text()
            try:
                result = await analyze_frame(frame_data)
                emotion = result["emotion"]
                confidence = result["confidence"]
                action = determine_adaptive_action(emotion, confidence)
                await websocket.send_json(
                    {"emotion": emotion, "confidence": confidence, "action_taken": action}
                )
            except Exception:
                await websocket.send_json({"emotion": "engaged", "confidence": 0.5, "action_taken": None})
    except WebSocketDisconnect:
        pass
