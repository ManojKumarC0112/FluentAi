from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables before initializing settings
load_dotenv()

from app.core.config import settings
from app.websocket.conversation import manager

from app.db.database import engine
from app.models.domain import Base
from app.api.api import api_router

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(api_router, prefix=settings.API_V1_STR)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since Clerk runs on frontend, allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "FluentAI Backend is running"}

@app.websocket("/api/v1/conversation/{conversation_id}")
async def websocket_endpoint(websocket: WebSocket, conversation_id: str):
    await manager.handle_websocket(websocket, conversation_id)

