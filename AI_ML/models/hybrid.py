"""
Hybrid Recommender — weighted fusion of content-based and collaborative
filtering scores with optional sentiment-aware re-ranking.
"""

import numpy as np
import pandas as pd
from typing import Optional

from config import (
    HYBRID_CONTENT_WEIGHT,
    HYBRID_COLLAB_WEIGHT,
    TOP_K_RECOMMENDATIONS,
)
from .content_based import ContentBasedRecommender
from .collaborative import CollaborativeRecommender


class HybridRecommender:
    """
    Blending strategy
    -----------------
    1. Get top-N from content-based  (scored 0–1)
    2. Get top-N from collaborative  (scored 0–1)
    3. Merge on chapter_id → hybrid_score = α·content + β·collab
    4. (Optional) Apply sentiment re-ranking:
       chapters from subjects where the student showed positive sentiment
       get a small boost; those tied to frustration/boredom get penalised.
    5. Return sorted top-K.

    The weights α, β are configurable and can later be tuned per-student.
    """

    def __init__(
        self,
        content_model: ContentBasedRecommender,
        collab_model: CollaborativeRecommender,
        content_weight: float = HYBRID_CONTENT_WEIGHT,
        collab_weight: float = HYBRID_COLLAB_WEIGHT,
    ):
        self.content_model = content_model
        self.collab_model = collab_model
        self.content_weight = content_weight
        self.collab_weight = collab_weight

    def recommend(
        self,
        student_id: str,
        student_profile_text: str,
        completed_chapter_ids: Optional[list] = None,
        interest_subjects: Optional[list] = None,
        sentiment_data: Optional[pd.DataFrame] = None,
        top_k: int = TOP_K_RECOMMENDATIONS,
    ) -> pd.DataFrame:
        pool_size = top_k * 3

        content_recs = self.content_model.recommend(
            student_profile_text=student_profile_text,
            completed_chapter_ids=completed_chapter_ids,
            top_k=pool_size,
            interest_subjects=interest_subjects,
        )

        collab_recs = self.collab_model.recommend(
            student_id=student_id,
            completed_chapter_ids=completed_chapter_ids,
            top_k=pool_size,
        )

        content_recs = self._normalise(content_recs, "content_score")
        collab_recs = self._normalise(collab_recs, "collab_score")

        content_part = content_recs[["chapter_id", "subject_name", "title", "difficulty", "content_score"]]
        collab_part = collab_recs[["chapter_id", "subject_name", "title", "difficulty", "collab_score"]]

        merged = pd.merge(
            content_part, collab_part,
            on="chapter_id", how="outer", suffixes=("", "_cb"),
        )

        for col in ["subject_name", "title", "difficulty"]:
            cb_col = f"{col}_cb"
            if cb_col in merged.columns:
                merged[col] = merged[col].fillna(merged[cb_col])
                merged.drop(columns=[cb_col], inplace=True)

        merged["content_score"] = merged["content_score"].fillna(0)
        merged["collab_score"] = merged["collab_score"].fillna(0)

        merged["hybrid_score"] = (
            self.content_weight * merged["content_score"]
            + self.collab_weight * merged["collab_score"]
        )

        if sentiment_data is not None and not sentiment_data.empty:
            merged = self._apply_sentiment_boost(merged, student_id, sentiment_data)

        merged = merged.sort_values("hybrid_score", ascending=False).head(top_k)
        cols = ["chapter_id", "subject_name", "title", "difficulty",
                "content_score", "collab_score", "hybrid_score"]
        return merged[[c for c in cols if c in merged.columns]].reset_index(drop=True)

    def _apply_sentiment_boost(
        self,
        recs: pd.DataFrame,
        student_id: str,
        sentiment: pd.DataFrame,
    ) -> pd.DataFrame:
        """
        Positive emotions (engaged/happy) in a subject → boost chapters.
        Negative emotions (frustrated/bored/drowsy) → penalise slightly so
        the student is steered away from content that causes disengagement.
        """
        positive = {"engaged", "happy"}
        negative = {"frustrated", "bored", "drowsy", "confused"}

        student_sent = sentiment[sentiment["student_id"] == student_id]
        if student_sent.empty:
            return recs

        counts = student_sent.groupby("emotion").size()
        pos_ratio = sum(counts.get(e, 0) for e in positive) / max(len(student_sent), 1)

        subject_sentiment = {}
        if "chapter_id" in student_sent.columns:
            for _, row in student_sent.iterrows():
                chap_id = row["chapter_id"]
                match = recs[recs["chapter_id"] == chap_id]
                if not match.empty:
                    subj = match.iloc[0].get("subject_name", "")
                    if subj:
                        subject_sentiment.setdefault(subj, []).append(row["emotion"])

        for subj, emotions in subject_sentiment.items():
            pos = sum(1 for e in emotions if e in positive)
            neg = sum(1 for e in emotions if e in negative)
            ratio = (pos - neg) / max(len(emotions), 1)
            mask = recs["subject_name"] == subj
            recs.loc[mask, "hybrid_score"] *= 1 + 0.1 * ratio

        return recs

    @staticmethod
    def _normalise(df: pd.DataFrame, col: str) -> pd.DataFrame:
        df = df.copy()
        mn, mx = df[col].min(), df[col].max()
        if mx > mn:
            df[col] = (df[col] - mn) / (mx - mn)
        else:
            df[col] = 0.5
        return df
