from fastapi import APIRouter
from app.api.routes import history, analytics

api_router = APIRouter()
api_router.include_router(history.router, prefix="/conversation", tags=["conversation"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
