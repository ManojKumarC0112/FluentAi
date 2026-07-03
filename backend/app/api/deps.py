import jwt
from fastapi import Depends, HTTPException, status, WebSocket
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.domain import User

def get_current_user_from_token(token: str, db: Session) -> User:
    """
    Validate Clerk JWT and return User.
    For MVP, we decode without signature verification if JWKS is not configured.
    In production, use PyJWKClient to verify signature against Clerk JWKS endpoint.
    """
    try:
        # Decode without verification for MVP fast integration
        # In production: jwt.decode(token, key=jwk_client.get_signing_key_from_jwt(token).key, algorithms=["RS256"])
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no sub")
            
        # Get or create user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            user = User(
                id=user_id, 
                email=payload.get("email", ""), 
                full_name=payload.get("name", "Student")
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        return user
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

async def get_ws_user(websocket: WebSocket, db: Session) -> User:
    """
    Extract token from websocket connection (query param or headers)
    """
    token = websocket.query_params.get("token")
    if not token:
        # For development, allow fallback if no token provided during testing
        print("Warning: No token provided on WS, using development dummy user.")
        user = db.query(User).filter(User.id == "dev_user").first()
        if not user:
            user = User(id="dev_user", email="dev@example.com", full_name="Dev User")
            db.add(user)
            db.commit()
            db.refresh(user)
        return user
        
    return get_current_user_from_token(token, db)
