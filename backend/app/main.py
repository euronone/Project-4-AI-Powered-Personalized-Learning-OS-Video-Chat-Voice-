import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import (
    activities,
    auth,
    curriculum,
    lessons,
    onboarding,
    progress,
    video,
    voice,
)

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "AI_ML"))
try:
    from api.routes import router as recommendation_router
except ModuleNotFoundError:
    # Keep core API bootable when optional AI/ML dependencies are not installed.
    recommendation_router = APIRouter()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title="LearnOS API",
    description="AI-Powered Personalized Learning OS",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(onboarding.router, prefix="/api/onboarding", tags=["onboarding"])
app.include_router(curriculum.router, prefix="/api/curriculum", tags=["curriculum"])
app.include_router(lessons.router, prefix="/api/lessons", tags=["lessons"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])
app.include_router(video.router, prefix="/api/video", tags=["video"])
app.include_router(activities.router, prefix="/api/activities", tags=["activities"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(recommendation_router, prefix="/api/recommendations", tags=["recommendations"])


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
