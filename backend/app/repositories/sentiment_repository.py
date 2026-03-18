from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from app.models.sentiment_log import SentimentLog

class SentimentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_logs_by_student_and_chapter(self, student_id: uuid.UUID, chapter_id: uuid.UUID) -> List[SentimentLog]:
        result = await self.session.execute(
            select(SentimentLog)
            .filter(SentimentLog.student_id == student_id)
            .filter(SentimentLog.chapter_id == chapter_id)
            .order_by(SentimentLog.timestamp.asc())
        )
        return result.scalars().all()

    async def get_recent_logs(self, student_id: uuid.UUID, limit: int = 10) -> List[SentimentLog]:
        result = await self.session.execute(
            select(SentimentLog)
            .filter(SentimentLog.student_id == student_id)
            .order_by(SentimentLog.timestamp.desc())
            .limit(limit)
        )
        # Reverse to get chronological order if needed
        return result.scalars().all()

    async def save_sentiment_log(self, log: SentimentLog) -> SentimentLog:
        if not log.timestamp:
            log.timestamp = datetime.now(timezone.utc)
        self.session.add(log)
        await self.session.flush()
        return log

    async def save_logs(self, logs: List[SentimentLog]) -> List[SentimentLog]:
        for log in logs:
            if not log.timestamp:
                log.timestamp = datetime.now(timezone.utc)
        self.session.add_all(logs)
        await self.session.flush()
        return logs
