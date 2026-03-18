"""
Content-Based Filtering Recommender.

Uses TF-IDF on student profiles and chapter metadata, then computes
cosine similarity to rank chapters most relevant to each student.
"""

import numpy as np
import pandas as pd
import pickle
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from config import CONTENT_TFIDF_MAX_FEATURES, TOP_K_RECOMMENDATIONS


class ContentBasedRecommender:
    """
    Strategy
    --------
    1. Build a TF-IDF matrix from chapter profiles (subject + title + tags + difficulty).
    2. Build a TF-IDF vector for each student (interests + strengths + grade + style).
    3. Score = cosine_similarity(student_vector, chapter_matrix).
    4. Boost chapters from subjects the student is interested in.
    5. Penalise chapters the student has already completed.
    """

    def __init__(self, max_features: int = CONTENT_TFIDF_MAX_FEATURES):
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            token_pattern=r"(?u)\b\w[\w\-]+\b",
            stop_words="english",
        )
        self.chapter_matrix = None
        self.chapter_ids: list = []
        self.chapters_df: pd.DataFrame | None = None
        self._fitted = False

    def fit(
        self,
        chapters_df: pd.DataFrame,
        chapter_profiles: pd.Series,
    ) -> "ContentBasedRecommender":
        self.chapters_df = chapters_df.copy().reset_index(drop=True)
        self.chapter_ids = chapters_df["chapter_id"].tolist()

        combined_corpus = chapter_profiles.tolist()
        self.vectorizer.fit(combined_corpus)
        self.chapter_matrix = self.vectorizer.transform(combined_corpus)
        self._fitted = True
        return self

    def recommend(
        self,
        student_profile_text: str,
        completed_chapter_ids: list | None = None,
        top_k: int = TOP_K_RECOMMENDATIONS,
        interest_subjects: list | None = None,
    ) -> pd.DataFrame:
        if not self._fitted:
            raise RuntimeError("Call .fit() first")

        student_vec = self.vectorizer.transform([student_profile_text])
        scores = cosine_similarity(student_vec, self.chapter_matrix).flatten()

        if interest_subjects:
            for i, row in self.chapters_df.iterrows():
                if row["subject_name"] in interest_subjects:
                    scores[i] *= 1.3

        result = self.chapters_df.copy()
        result["content_score"] = scores

        if completed_chapter_ids:
            result = result[~result["chapter_id"].isin(completed_chapter_ids)]

        result = result.sort_values("content_score", ascending=False).head(top_k)
        return result[["chapter_id", "subject_name", "title", "difficulty", "content_score"]].reset_index(drop=True)

    def predict(self, student_profile_text: str, chapter_id: str) -> float | None:
        """Predict the content similarity score for a specific chapter."""
        if not self._fitted:
            raise RuntimeError("Call .fit() first")
        if chapter_id not in self.chapter_ids:
            return None
        student_vec = self.vectorizer.transform([student_profile_text])
        c_idx = self.chapter_ids.index(chapter_id)
        return float(cosine_similarity(student_vec, self.chapter_matrix[c_idx]).flatten()[0])

    def save(self, path: Path):
        with open(path, "wb") as f:
            pickle.dump({
                "vectorizer": self.vectorizer,
                "chapter_matrix": self.chapter_matrix,
                "chapter_ids": self.chapter_ids,
                "chapters_df": self.chapters_df,
            }, f)

    def load(self, path: Path) -> "ContentBasedRecommender":
        with open(path, "rb") as f:
            data = pickle.load(f)
        self.vectorizer = data["vectorizer"]
        self.chapter_matrix = data["chapter_matrix"]
        self.chapter_ids = data["chapter_ids"]
        self.chapters_df = data["chapters_df"]
        self._fitted = True
        return self
