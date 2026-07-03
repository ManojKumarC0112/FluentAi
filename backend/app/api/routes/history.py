from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.domain import Conversation, Message
from app.api.deps import get_current_user_from_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    return get_current_user_from_token(credentials.credentials, db)

@router.get("/")
def get_conversation_history(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get all past conversations for the current user."""
    conversations = db.query(Conversation).filter(Conversation.user_id == current_user.id).order_by(Conversation.created_at.desc()).all()
    
    # Format for frontend
    result = []
    for c in conversations:
        # Get first message snippet
        first_msg = db.query(Message).filter(Message.conversation_id == c.id, Message.role == "user").order_by(Message.created_at.asc()).first()
        snippet = first_msg.content if first_msg else "No speech recorded."
        word_count = len(snippet.split())
        
        result.append({
            "id": str(c.id),
            "mode": c.mode or "normal_chat",
            "topic": c.topic or "Conversation",
            "date": c.created_at.isoformat()[:10],
            "duration": c.duration_seconds or 0,
            "snippet": snippet,
            "fluency": c.score_fluency or 0.0,
            "grammar": c.score_grammar or 0.0,
            "vocabulary": c.score_vocabulary or 0.0,
            "words": word_count,
            "corrections": 0  # Could aggregate total grammar_corrections from messages here if desired
        })
        
    return result

@router.get("/{conversation_id}")
def get_conversation_detail(conversation_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get detail and full transcript for a specific conversation."""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()
    
    return {
        "id": conversation.id,
        "mode": conversation.mode,
        "topic": conversation.topic,
        "created_at": conversation.created_at.isoformat(),
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "grammar_corrections": m.grammar_corrections,
                "created_at": m.created_at.isoformat()
            } for m in messages
        ]
    }
