"""
FastAPI routes for the recommendation engine.

Mount this router in your main FastAPI app:
    from AI_ML.api.routes import router as recommendation_router
    app.include_router(recommendation_router, prefix="/api/recommendations")
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from engine.recommender import RecommendationEngine

router = APIRouter(tags=["recommendations"])

_engine: RecommendationEngine | None = None


def get_engine() -> RecommendationEngine:
    global _engine
    if _engine is None:
        _engine = RecommendationEngine()
        try:
            _engine.load()
        except FileNotFoundError:
            _engine.train()
            _engine.save()
    return _engine


class ChapterRecommendation(BaseModel):
    chapter_id: str
    subject_name: str
    title: str
    difficulty: str
    content_score: float
    collab_score: float
    hybrid_score: float


class SubjectRecommendation(BaseModel):
    subject_name: str
    relevance_score: float


class SimilarStudent(BaseModel):
    student_id: str
    similarity: float


@router.get("/chapters/{student_id}", response_model=list[ChapterRecommendation])
def recommend_chapters(
    student_id: str,
    top_k: int = Query(default=10, ge=1, le=50),
    include_sentiment: bool = Query(default=True),
):
    """Recommend chapters for a student using the hybrid engine."""
    engine = get_engine()
    recs = engine.get_recommendations(student_id, top_k=top_k, include_sentiment=include_sentiment)
    if recs.empty:
        raise HTTPException(status_code=404, detail="Student not found or no recommendations available")
    return recs.to_dict("records")


@router.get("/subjects/{student_id}", response_model=list[SubjectRecommendation])
def recommend_subjects(
    student_id: str,
    top_k: int = Query(default=5, ge=1, le=15),
):
    """Recommend subjects for a student."""
    engine = get_engine()
    recs = engine.get_subject_recommendations(student_id, top_k=top_k)
    if recs.empty:
        raise HTTPException(status_code=404, detail="Student not found")
    return recs.to_dict("records")


@router.get("/similar-students/{student_id}", response_model=list[SimilarStudent])
def similar_students(
    student_id: str,
    top_n: int = Query(default=5, ge=1, le=20),
):
    """Find students with similar learning patterns."""
    engine = get_engine()
    results = engine.get_similar_students(student_id, top_n=top_n)
    if not results:
        raise HTTPException(status_code=404, detail="Student not found")
    return [{"student_id": sid, "similarity": sim} for sid, sim in results]


@router.post("/retrain")
def retrain():
    """Re-train models on latest data."""
    engine = get_engine()
    engine.train()
    engine.save()
    return {"status": "ok", "message": "Models retrained and saved"}
