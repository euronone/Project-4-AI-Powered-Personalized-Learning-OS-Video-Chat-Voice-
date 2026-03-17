"""
Collaborative Filtering Recommender.

Provides two factorisation strategies:
  • SVD  — works well with sparse matrices (implicit zeros = "not seen")
  • NMF  — all-positive factors, good interpretability

Both decompose the student×chapter rating matrix and reconstruct it
to predict unseen ratings.
"""

import numpy as np
import pandas as pd
import pickle
from pathlib import Path
from sklearn.decomposition import TruncatedSVD, NMF
from sklearn.preprocessing import MinMaxScaler

from config import SVD_N_COMPONENTS, NMF_N_COMPONENTS, TOP_K_RECOMMENDATIONS


class CollaborativeRecommender:
    """
    Parameters
    ----------
    method : "svd" | "nmf"
    n_components : latent dimensions
    """

    def __init__(
        self,
        method: str = "svd",
        n_components: int | None = None,
    ):
        self.method = method.lower()
        if n_components is None:
            n_components = SVD_N_COMPONENTS if self.method == "svd" else NMF_N_COMPONENTS
        self.n_components = n_components

        self.model = (
            TruncatedSVD(n_components=n_components, random_state=42)
            if self.method == "svd"
            else NMF(n_components=n_components, init="nndsvda", random_state=42, max_iter=400)
        )
        self.scaler = MinMaxScaler()

        self.student_factors: np.ndarray | None = None
        self.item_factors: np.ndarray | None = None
        self.predicted_matrix: np.ndarray | None = None
        self.student_ids: list = []
        self.chapter_ids: list = []
        self.chapters_lookup: pd.DataFrame | None = None
        self._fitted = False

    def fit(
        self,
        user_item_matrix: pd.DataFrame,
        chapters_df: pd.DataFrame,
    ) -> "CollaborativeRecommender":
        self.student_ids = list(user_item_matrix.index)
        self.chapter_ids = list(user_item_matrix.columns)
        self.chapters_lookup = chapters_df.set_index("chapter_id")

        matrix = user_item_matrix.values.astype(np.float64)

        if self.method == "nmf":
            matrix = np.clip(matrix, 0, None)

        self.student_factors = self.model.fit_transform(matrix)

        if self.method == "svd":
            self.item_factors = self.model.components_
            self.predicted_matrix = self.student_factors @ self.item_factors
        else:
            self.item_factors = self.model.components_
            self.predicted_matrix = self.student_factors @ self.item_factors

        self.predicted_matrix = self.scaler.fit_transform(
            self.predicted_matrix.clip(0)
        )
        self._fitted = True
        return self

    def recommend(
        self,
        student_id: str,
        completed_chapter_ids: list | None = None,
        top_k: int = TOP_K_RECOMMENDATIONS,
    ) -> pd.DataFrame:
        if not self._fitted:
            raise RuntimeError("Call .fit() first")

        if student_id not in self.student_ids:
            return pd.DataFrame(columns=[
                "chapter_id", "subject_name", "title", "difficulty", "collab_score",
            ])

        idx = self.student_ids.index(student_id)
        scores = self.predicted_matrix[idx]

        result = pd.DataFrame({
            "chapter_id": self.chapter_ids,
            "collab_score": scores,
        })

        result = result.merge(
            self.chapters_lookup[["subject_name", "title", "difficulty"]],
            left_on="chapter_id",
            right_index=True,
            how="left",
        )

        if completed_chapter_ids:
            result = result[~result["chapter_id"].isin(completed_chapter_ids)]

        result = result.sort_values("collab_score", ascending=False).head(top_k)
        return result[["chapter_id", "subject_name", "title", "difficulty", "collab_score"]].reset_index(drop=True)

    def find_similar_students(
        self, student_id: str, top_n: int = 10
    ) -> list[tuple[str, float]]:
        """Return the most similar students based on latent factor cosine similarity."""
        if not self._fitted or student_id not in self.student_ids:
            return []

        idx = self.student_ids.index(student_id)
        target = self.student_factors[idx].reshape(1, -1)
        from sklearn.metrics.pairwise import cosine_similarity
        sims = cosine_similarity(target, self.student_factors).flatten()
        ranked = np.argsort(sims)[::-1]

        results = []
        for i in ranked:
            if self.student_ids[i] != student_id:
                results.append((self.student_ids[i], round(float(sims[i]), 4)))
            if len(results) >= top_n:
                break
        return results

    def save(self, path: Path):
        with open(path, "wb") as f:
            pickle.dump({
                "method": self.method,
                "model": self.model,
                "scaler": self.scaler,
                "student_factors": self.student_factors,
                "item_factors": self.item_factors,
                "predicted_matrix": self.predicted_matrix,
                "student_ids": self.student_ids,
                "chapter_ids": self.chapter_ids,
                "chapters_lookup": self.chapters_lookup,
            }, f)

    def load(self, path: Path) -> "CollaborativeRecommender":
        with open(path, "rb") as f:
            data = pickle.load(f)
        self.method = data["method"]
        self.model = data["model"]
        self.scaler = data["scaler"]
        self.student_factors = data["student_factors"]
        self.item_factors = data["item_factors"]
        self.predicted_matrix = data["predicted_matrix"]
        self.student_ids = data["student_ids"]
        self.chapter_ids = data["chapter_ids"]
        self.chapters_lookup = data["chapters_lookup"]
        self._fitted = True
        return self
