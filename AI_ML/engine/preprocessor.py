"""
Loads CSVs, engineers features, and produces the matrices consumed
by the content-based and collaborative filtering models.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Tuple

from config import DATA_DIR


def load_data(data_dir: Path = DATA_DIR) -> Dict[str, pd.DataFrame]:
    return {
        "students":     pd.read_csv(data_dir / "students.csv"),
        "subjects":     pd.read_csv(data_dir / "subjects.csv"),
        "chapters":     pd.read_csv(data_dir / "chapters.csv"),
        "interactions": pd.read_csv(data_dir / "interactions.csv"),
        "sentiment":    pd.read_csv(data_dir / "sentiment.csv"),
    }


def build_student_profile_text(students: pd.DataFrame) -> pd.Series:
    """
    Combine student metadata into a single text string for TF-IDF.
    Format: "grade:<g> interests:<a|b|c> strengths:<x> weaknesses:<y> style:<s>"
    """
    return (
        "grade:" + students["grade"].astype(str)
        + " interests:" + students["interests"].fillna("")
        + " strengths:" + students["strengths"].fillna("")
        + " weaknesses:" + students["weaknesses"].fillna("")
        + " style:" + students["learning_style"].fillna("")
    )


def build_chapter_profile_text(chapters: pd.DataFrame) -> pd.Series:
    """
    Combine chapter metadata into text for content similarity.
    """
    return (
        chapters["subject_name"]
        + " " + chapters["title"]
        + " " + chapters["difficulty"]
        + " " + chapters["tags"].fillna("")
    )


def build_user_item_matrix(
    interactions: pd.DataFrame,
    value_col: str = "rating",
) -> Tuple[pd.DataFrame, list, list]:
    """
    Pivot interactions into a student × chapter matrix.
    Missing values filled with 0 (unrated/unseen).
    Returns (matrix_df, student_ids, chapter_ids).
    """
    pivot = interactions.pivot_table(
        index="student_id",
        columns="chapter_id",
        values=value_col,
        aggfunc="mean",
    ).fillna(0)
    return pivot, list(pivot.index), list(pivot.columns)


def build_subject_level_matrix(
    interactions: pd.DataFrame,
    value_col: str = "rating",
) -> pd.DataFrame:
    """
    Coarser student × subject matrix (averages chapter-level ratings).
    """
    pivot = interactions.pivot_table(
        index="student_id",
        columns="subject_name",
        values=value_col,
        aggfunc="mean",
    ).fillna(0)
    return pivot


def enrich_interactions_with_sentiment(
    interactions: pd.DataFrame, sentiment: pd.DataFrame
) -> pd.DataFrame:
    """
    Aggregate sentiment per (student, chapter) and merge into interactions.
    """
    emotion_score_map = {
        "engaged": 1.0, "happy": 0.9, "confused": 0.3,
        "bored": 0.2, "frustrated": 0.1, "drowsy": 0.1,
    }
    sentiment = sentiment.copy()
    sentiment["emotion_score"] = (
        sentiment["emotion"].map(emotion_score_map).fillna(0.5)
        * sentiment["confidence"]
    )
    agg = (
        sentiment.groupby(["student_id", "chapter_id"])["emotion_score"]
        .mean()
        .reset_index()
        .rename(columns={"emotion_score": "avg_sentiment"})
    )
    return interactions.merge(agg, on=["student_id", "chapter_id"], how="left")
