from fastapi import APIRouter
from app.api import (
    health,
    competitors,
    activities,
    dashboard,
    timeline,
    insights,
    alerts,
    chat,
)

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(competitors.router)
api_router.include_router(activities.router)
api_router.include_router(dashboard.router)
api_router.include_router(timeline.router)
api_router.include_router(insights.router)
api_router.include_router(alerts.router)
api_router.include_router(chat.router)
