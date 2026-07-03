from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.domain import Conversation, User, Message
from app.api.deps import get_current_user_from_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    return get_current_user_from_token(credentials.credentials, db)

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get high level stats for the dashboard: streak, xp, scores."""
    
    # 1. Total Conversations
    total_convs = db.query(func.count(Conversation.id)).filter(Conversation.user_id == current_user.id).scalar() or 0
    
    # 2. Speaking time (mock duration logic for MVP)
    # Ideally conversation.duration_seconds is properly populated
    total_duration_sec = db.query(func.sum(Conversation.duration_seconds)).filter(Conversation.user_id == current_user.id).scalar() or 0
    
    # 3. Overall average scores
    avg_fluency = db.query(func.avg(Conversation.score_fluency)).filter(Conversation.user_id == current_user.id).scalar() or 0.0
    avg_grammar = db.query(func.avg(Conversation.score_grammar)).filter(Conversation.user_id == current_user.id).scalar() or 0.0
    avg_vocab = db.query(func.avg(Conversation.score_vocabulary)).filter(Conversation.user_id == current_user.id).scalar() or 0.0
    
    return {
        "user": {
            "name": current_user.full_name,
            "level": current_user.current_level or "Intermediate (B1)",
            "goal": current_user.target_goal or "General Fluency"
        },
        "stats": {
            "streak": current_user.current_streak,
            "xp": current_user.xp,
            "conversationsCompleted": total_convs,
            "minutesPracticed": round(total_duration_sec / 60)
        },
        "recentScores": {
            "fluency": round(avg_fluency, 1),
            "grammar": round(avg_grammar, 1),
            "vocabulary": round(avg_vocab, 1),
            "confidence": round((avg_fluency + avg_grammar) / 2, 1) if avg_fluency > 0 else 0.0
        },
        "weeklyProgress": [
            {"day": "Mon", "score": 7.2},
            {"day": "Tue", "score": 7.5},
            {"day": "Wed", "score": 7.4},
            {"day": "Thu", "score": 7.8},
            {"day": "Fri", "score": 8.0},
            {"day": "Sat", "score": 8.1},
            {"day": "Sun", "score": 8.3}
        ]
    }

@router.get("/trends")
def get_analytics_trends(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return {
        "weeklyTrend": [
            {"week": "W1", "fluency": 7.1, "grammar": 6.8, "vocabulary": 7.0},
            {"week": "W2", "fluency": 7.4, "grammar": 7.2, "vocabulary": 7.3},
            {"week": "W3", "fluency": 7.8, "grammar": 7.6, "vocabulary": 7.5},
            {"week": "W4", "fluency": 8.2, "grammar": 8.0, "vocabulary": 8.1},
        ],
        "dailySpeaking": [
            {"day": "Mon", "minutes": 12}, {"day": "Tue", "minutes": 18},
            {"day": "Wed", "minutes": 9}, {"day": "Thu", "minutes": 22},
            {"day": "Fri", "minutes": 15}, {"day": "Sat", "minutes": 25},
            {"day": "Sun", "minutes": 14},
        ],
        "grammarErrors": [
            {"category": "Tenses", "count": 18},
            {"category": "Articles", "count": 12},
            {"category": "Prepositions", "count": 9},
            {"category": "Agreement", "count": 6},
            {"category": "Structure", "count": 4},
        ],
        "radarData": [
            {"metric": "Fluency", "score": 8.2, "fullMark": 10},
            {"metric": "Grammar", "score": 7.8, "fullMark": 10},
            {"metric": "Vocabulary", "score": 8.1, "fullMark": 10},
            {"metric": "Confidence", "score": 8.5, "fullMark": 10},
            {"metric": "Pronunciation", "score": 7.4, "fullMark": 10},
            {"metric": "Speed", "score": 7.9, "fullMark": 10},
        ],
        "wpmTrend": [
            {"day": "Mon", "wpm": 118}, {"day": "Tue", "wpm": 125},
            {"day": "Wed", "wpm": 121}, {"day": "Thu", "wpm": 133},
            {"day": "Fri", "wpm": 129}, {"day": "Sat", "wpm": 140},
            {"day": "Sun", "wpm": 136},
        ]
    }

@router.get("/profile")
def get_user_profile(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    total_convs = db.query(func.count(Conversation.id)).filter(Conversation.user_id == current_user.id).scalar() or 0
    ielts_convs = db.query(func.count(Conversation.id)).filter(Conversation.user_id == current_user.id, Conversation.mode == "ielts").scalar() or 0
    
    # Calculate badges dynamically based on real data
    streak = current_user.current_streak or 0
    avg_grammar = db.query(func.avg(Conversation.score_grammar)).filter(Conversation.user_id == current_user.id).scalar() or 0
    avg_fluency = db.query(func.avg(Conversation.score_fluency)).filter(Conversation.user_id == current_user.id).scalar() or 0

    return {
        "user": {
            "name": current_user.full_name,
            "level": current_user.current_level or "Intermediate (B1)",
            "goal": current_user.target_goal or "Daily Conversation",
            "xp": current_user.xp,
        },
        "profileStats": [
            {"label": "Current Streak", "value": f"{streak} days", "sub": "Best: 14 days"},
            {"label": "Conversations", "value": str(total_convs), "sub": "This month"},
            {"label": "Avg Fluency", "value": str(round(avg_fluency, 1)), "sub": "↑ from 7.8"},
            {"label": "Badges Earned", "value": f"{sum([streak >= 7, total_convs >= 100, ielts_convs >= 5, streak >= 30])} / 8", "sub": "Keep practicing to unlock more!"}
        ],
        "badges": [
            {"icon": "🔥", "name": "7-Day Streak", "desc": "Practiced 7 days in a row", "earned": streak >= 7},
            {"icon": "🎯", "name": "Sharpshooter", "desc": "90%+ grammar accuracy", "earned": avg_grammar >= 9.0},
            {"icon": "💬", "name": "Chatterbox", "desc": "100 conversations", "earned": total_convs >= 100},
            {"icon": "⚡", "name": "Speed Talker", "desc": "Fast thinking speed", "earned": avg_fluency >= 8.5},
            {"icon": "🏆", "name": "Fluency Master", "desc": "Score 9.0+ overall", "earned": avg_fluency >= 9.0},
            {"icon": "📚", "name": "Vocab Virtuoso", "desc": "500 unique words used", "earned": False},
            {"icon": "🎓", "name": "IELTS Ready", "desc": "Complete 5 IELTS sessions", "earned": ielts_convs >= 5},
            {"icon": "🌟", "name": "30-Day Warrior", "desc": "Practice 30 days in a row", "earned": streak >= 30},
        ],
        "learningSettings": [
            {"label": "English Level", "value": current_user.current_level or "B1 Intermediate"},
            {"label": "Primary Goal", "value": current_user.target_goal or "Daily Conversation"},
            {"label": "Daily Target", "value": "15 minutes"},
            {"label": "Preferred Voice", "value": "Aria (Microsoft Neural)"},
        ],
        "notifications": [
            {"label": "Daily practice reminder", "desc": "Remind me to practice every day", "enabled": True},
            {"label": "Streak alerts", "desc": "Don't let me lose my streak", "enabled": True},
            {"label": "Weekly report", "desc": "Send weekly progress summary", "enabled": False},
            {"label": "Tips & challenges", "desc": "Send daily speaking tips", "enabled": False},
        ]
    }

from pydantic import BaseModel
class ProfileUpdateModel(BaseModel):
    name: str

@router.put("/profile")
def update_user_profile(data: ProfileUpdateModel, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user = db.query(User).filter(User.id == current_user.id).first()
    if user:
        user.full_name = data.name
        db.commit()
    return {"status": "success"}
