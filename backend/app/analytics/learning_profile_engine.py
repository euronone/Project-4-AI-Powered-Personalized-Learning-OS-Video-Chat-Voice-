import logging
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Dict, Any, List

from app.repositories.activity_repository import ActivityRepository
from app.repositories.sentiment_repository import SentimentRepository
from app.repositories.student_repository import StudentRepository
from app.repositories.curriculum_repository import CurriculumRepository
from app.models.activity import ActivityType

logger = logging.getLogger(__name__)

class LearningProfileEngine:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.activity_repo = ActivityRepository(session)
        self.sentiment_repo = SentimentRepository(session)
        self.student_repo = StudentRepository(session)
        self.curriculum_repo = CurriculumRepository(session)

    async def generate_profile(self, student_id: uuid.UUID) -> Dict[str, Any]:
        """
        Identify strengths, weaknesses, and generate recommendations.
        """
        try:
            student = await self.student_repo.get_student_by_id(student_id)
            if not student:
                raise ValueError("Student not found")

            # Basic analysis (Mocked logic for simplicity, easily extensible)
            # Fetch all subjects for the student
            subjects = await self.curriculum_repo.get_subjects_by_student_id(student_id)
            
            strengths = []
            weaknesses = []
            
            # Analyze subjects
            for subject in subjects:
                chapters = await self.curriculum_repo.get_chapters_by_subject_id(subject.id)
                for chapter in chapters:
                    submissions = await self.activity_repo.get_submissions_by_student_and_chapter(student_id, chapter.id)
                    # Simple heuristic
                    if submissions:
                        avg_score = sum(s.score for s in submissions) / len(submissions)
                        if avg_score >= 80:
                            strengths.append(chapter.title)
                        elif avg_score < 60:
                            weaknesses.append(chapter.title)

            # Generate basic recommendations
            recommendations = []
            if weaknesses:
                recommendations.append(f"Review core concepts in: {', '.join(weaknesses[:3])}")
            if strengths:
                recommendations.append(f"Explore advanced topics in: {', '.join(strengths[:3])}")
            
            if not strengths and not weaknesses:
                recommendations.append("Continue with your current learning path.")

            # Sentiment-based insights
            recent_logs = await self.sentiment_repo.get_recent_logs(student_id, limit=50)
            dominant_emotion = "engaged" # fallback
            
            if recent_logs:
                # Count occurrances
                emotion_counts = {}
                for log in recent_logs:
                    emotion = str(log.emotion)
                    emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
                    
                dominant_emotion = max(emotion_counts, key=emotion_counts.get)
                
            if dominant_emotion in ["frustrated", "confused"]:
                recommendations.append("You seem to be facing some friction. Don't hesitate to ask the AI Tutor for step-by-step guidance!")

            return {
                "student_id": str(student_id),
                "strengths": list(set(strengths)),
                "weaknesses": list(set(weaknesses)),
                "dominant_emotion": dominant_emotion,
                "recommendations": recommendations
            }
        except Exception as e:
            logger.error(f"Failed to generate learning profile for {student_id}: {str(e)}")
            return {
                "error": str(e),
                "strengths": [],
                "weaknesses": [],
                "recommendations": ["Unable to generate recommendations at this time."]
            }
