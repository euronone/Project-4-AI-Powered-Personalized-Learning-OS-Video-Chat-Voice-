"""
Evaluate the recommendation engine with standard IR / RecSys metrics.

Metrics computed:
  • Precision@K — fraction of recommended items that are relevant
  • Recall@K    — fraction of relevant items that are recommended
  • NDCG@K      — normalised discounted cumulative gain
  • Coverage    — fraction of all chapters that appear in any recommendation
  • Diversity   — average intra-list distance (subject diversity)

Run:
    python evaluate.py
"""

import logging
import numpy as np
import pandas as pd
from collections import defaultdict

from engine.recommender import RecommendationEngine
from engine.preprocessor import load_data
from config import DATA_DIR, TOP_K_RECOMMENDATIONS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


def dcg_at_k(relevances: list[float], k: int) -> float:
    relevances = relevances[:k]
    return sum(rel / np.log2(idx + 2) for idx, rel in enumerate(relevances))


def ndcg_at_k(relevances: list[float], k: int) -> float:
    actual = dcg_at_k(relevances, k)
    ideal = dcg_at_k(sorted(relevances, reverse=True), k)
    return actual / ideal if ideal > 0 else 0.0


def evaluate(top_k: int = TOP_K_RECOMMENDATIONS, sample_size: int = 100):
    logger.info("Loading engine …")
    engine = RecommendationEngine()
    try:
        engine.load()
    except FileNotFoundError:
        engine.train()
        engine.save()

    data = load_data(DATA_DIR)
    students = data["students"]
    interactions = data["interactions"]
    all_chapter_ids = set(data["chapters"]["chapter_id"])

    sample_students = students.sample(min(sample_size, len(students)), random_state=42)

    precisions, recalls, ndcgs = [], [], []
    all_recommended = set()
    diversities = []

    for _, student in sample_students.iterrows():
        sid = student["student_id"]

        student_ints = interactions[interactions["student_id"] == sid]
        relevant = set(
            student_ints[student_ints["rating"] >= 3.5]["chapter_id"].tolist()
        )
        if not relevant:
            continue

        recs = engine.get_recommendations(sid, top_k=top_k, include_sentiment=True)
        if recs.empty:
            continue

        rec_ids = recs["chapter_id"].tolist()
        all_recommended.update(rec_ids)

        hits = [1.0 if cid in relevant else 0.0 for cid in rec_ids]
        precision = sum(hits) / len(hits) if hits else 0
        recall = sum(hits) / len(relevant) if relevant else 0
        ndcg = ndcg_at_k(hits, top_k)

        precisions.append(precision)
        recalls.append(recall)
        ndcgs.append(ndcg)

        subjects_in_list = recs["subject_name"].tolist()
        unique_subjects = len(set(subjects_in_list))
        diversities.append(unique_subjects / len(subjects_in_list) if subjects_in_list else 0)

    coverage = len(all_recommended) / len(all_chapter_ids) if all_chapter_ids else 0

    logger.info(f"\n{'='*50}")
    logger.info(f"  EVALUATION RESULTS  (K={top_k}, students={len(precisions)})")
    logger.info(f"{'='*50}")
    logger.info(f"  Precision@{top_k}:  {np.mean(precisions):.4f}  (±{np.std(precisions):.4f})")
    logger.info(f"  Recall@{top_k}:     {np.mean(recalls):.4f}  (±{np.std(recalls):.4f})")
    logger.info(f"  NDCG@{top_k}:       {np.mean(ndcgs):.4f}  (±{np.std(ndcgs):.4f})")
    logger.info(f"  Coverage:         {coverage:.4f}  ({len(all_recommended)}/{len(all_chapter_ids)} chapters)")
    logger.info(f"  Diversity:        {np.mean(diversities):.4f}  (subject variety per list)")
    logger.info(f"{'='*50}\n")

    return {
        "precision": np.mean(precisions),
        "recall": np.mean(recalls),
        "ndcg": np.mean(ndcgs),
        "coverage": coverage,
        "diversity": np.mean(diversities),
    }


if __name__ == "__main__":
    evaluate()
