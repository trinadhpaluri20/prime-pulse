from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, competitors, events, recall, analyze, memory

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(competitors.router, tags=["Competitors"])
api_router.include_router(events.router, tags=["Competitor Events"])
api_router.include_router(recall.router, tags=["Recall & Historical Intelligence"])
api_router.include_router(analyze.router, tags=["AI Agent Analysis (Grok)"])
api_router.include_router(memory.router, tags=["Hindsight Memory (Dev Test)"])
