"""
Main orchestrator — loads data, trains (or loads cached) models,
and exposes a simple .get_recommendations() method.
"""

import logging
from pathlib import Path
from typing import Optional

import pandas as pd

from config import DATA_DIR, TOP_K_RECOMMENDATIONS, BASE_DIR
from engine.preprocessor import (
    load_data,
    build_student_profile_text,
    build_chapter_profile_text,
    build_user_item_matrix,
    enrich_interactions_with_sentiment,
)
from models.content_based import ContentBasedRecommender
from models.collaborative import CollaborativeRecommender
from models.hybrid import HybridRecommender

logger = logging.getLogger(__name__)

MODEL_DIR = BASE_DIR / "saved_models"


class RecommendationEngine:
    """
    High-level API consumed by FastAPI routes or scripts.

    Usage
    -----
        engine = RecommendationEngine()
        engine.train()                         # first time
        engine.save()                          # persist to disk
        engine.load()                          # on restart
        recs = engine.get_recommendations(student_id, top_k=10)
    """

    def __init__(self, data_dir: Path = DATA_DIR):
        self.data_dir = data_dir
        self.data: dict[str, pd.DataFrame] = {}
        self.content_model = ContentBasedRecommender()
        self.collab_model = CollaborativeRecommender(method="svd")
        self.hybrid: HybridRecommender | None = None
        self._ready = False

    def train(self) -> "RecommendationEngine":
        logger.info("Loading data …")
        self.data = load_data(self.data_dir)

        students = self.data["students"]
        chapters = self.data["chapters"]
        interactions = self.data["interactions"]
        sentiment = self.data["sentiment"]

        interactions = enrich_interactions_with_sentiment(interactions, sentiment)

        chapter_profiles = build_chapter_profile_text(chapters)
        user_item, _, _ = build_user_item_matrix(interactions, value_col="rating")

        logger.info("Training content-based model …")
        self.content_model.fit(chapters, chapter_profiles)

        logger.info("Training collaborative model (SVD) …")
        self.collab_model.fit(user_item, chapters)

        self.hybrid = HybridRecommender(self.content_model, self.collab_model)
        self._ready = True
        logger.info("Training complete.")
        return self

    def get_recommendations(
        self,
        student_id: str,
        top_k: int = TOP_K_RECOMMENDATIONS,
        include_sentiment: bool = True,
    ) -> pd.DataFrame:
        if not self._ready:
            raise RuntimeError("Engine not trained — call .train() or .load() first")

        students = self.data["students"]
        interactions = self.data["interactions"]
        sentiment = self.data["sentiment"]

        student_row = students[students["student_id"] == student_id]
        if student_row.empty:
            logger.warning(f"Student {student_id} not found, returning empty")
            return pd.DataFrame()

        student = student_row.iloc[0]
        profile_text = build_student_profile_text(student_row).iloc[0]
        interests = student["interests"].split("|") if pd.notna(student["interests"]) else []

        completed = interactions[
            (interactions["student_id"] == student_id)
            & (interactions["status"] == "completed")
        ]["chapter_id"].tolist()

        sent_df = sentiment if include_sentiment else None

        return self.hybrid.recommend(
            student_id=student_id,
            student_profile_text=profile_text,
            completed_chapter_ids=completed,
            interest_subjects=interests,
            sentiment_data=sent_df,
            top_k=top_k,
        )

    def get_similar_students(self, student_id: str, top_n: int = 5) -> list:
        if not self._ready:
            raise RuntimeError("Engine not trained")
        return self.collab_model.find_similar_students(student_id, top_n)

    def get_subject_recommendations(
        self, student_id: str, top_k: int = 5
    ) -> pd.DataFrame:
        """Recommend at subject (not chapter) level."""
        recs = self.get_recommendations(student_id, top_k=top_k * 3)
        if recs.empty:
            return recs
        subject_scores = (
            recs.groupby("subject_name")["hybrid_score"]
            .mean()
            .sort_values(ascending=False)
            .head(top_k)
            .reset_index()
        )
        subject_scores.columns = ["subject_name", "relevance_score"]
        return subject_scores

    def save(self, model_dir: Path = MODEL_DIR):
        model_dir.mkdir(parents=True, exist_ok=True)
        self.content_model.save(model_dir / "content_based.pkl")
        self.collab_model.save(model_dir / "collaborative.pkl")
        logger.info(f"Models saved to {model_dir}")

    def load(self, model_dir: Path = MODEL_DIR) -> "RecommendationEngine":
        self.data = load_data(self.data_dir)
        self.content_model.load(model_dir / "content_based.pkl")
        self.collab_model.load(model_dir / "collaborative.pkl")
        self.hybrid = HybridRecommender(self.content_model, self.collab_model)
        self._ready = True
        logger.info(f"Models loaded from {model_dir}")
        return self
