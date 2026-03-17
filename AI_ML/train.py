"""
Train the recommendation engine end-to-end.

Run from the AI_ML directory:
    python train.py
"""

import logging
import sys
import time

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


def main():
    from engine.recommender import RecommendationEngine
    from config import DATA_DIR

    if not (DATA_DIR / "students.csv").exists():
        logger.info("Synthetic data not found — generating …")
        from data.generate_synthetic_data import main as gen_data
        gen_data()

    logger.info("Initialising recommendation engine …")
    engine = RecommendationEngine()

    t0 = time.perf_counter()
    engine.train()
    elapsed = time.perf_counter() - t0
    logger.info(f"Training completed in {elapsed:.2f}s")

    engine.save()
    logger.info("Models saved.")

    logger.info("\n── Quick smoke test ──")
    students = engine.data["students"]
    sample_id = students.iloc[0]["student_id"]
    sample_name = students.iloc[0]["name"]
    logger.info(f"Student: {sample_name} (grade {students.iloc[0]['grade']})")
    logger.info(f"  Interests: {students.iloc[0]['interests']}")

    recs = engine.get_recommendations(sample_id, top_k=8)
    logger.info(f"\n  Top 8 Chapter Recommendations:")
    for i, row in recs.iterrows():
        logger.info(
            f"    {i+1}. [{row['subject_name']}] {row['title']}  "
            f"(hybrid={row['hybrid_score']:.3f})"
        )

    subj_recs = engine.get_subject_recommendations(sample_id, top_k=5)
    logger.info(f"\n  Top 5 Subject Recommendations:")
    for i, row in subj_recs.iterrows():
        logger.info(f"    {i+1}. {row['subject_name']}  (score={row['relevance_score']:.3f})")

    similar = engine.get_similar_students(sample_id, top_n=3)
    logger.info(f"\n  Most similar students:")
    for sid, sim in similar:
        name = students[students["student_id"] == sid].iloc[0]["name"]
        logger.info(f"    {name} (similarity={sim:.4f})")

    logger.info("\nDone.")


if __name__ == "__main__":
    main()
