from sqlalchemy import Column, String, Integer, DateTime, Boolean, Float, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # Clerk User ID
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    
    # Profile Data
    target_goal = Column(String, nullable=True) # e.g. "career", "travel", "ielts"
    current_level = Column(String, nullable=True) # e.g. "intermediate"
    daily_goal_mins = Column(Integer, default=15)
    
    # Progression
    xp = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_practice_date = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, index=True) # UUID
    user_id = Column(String, ForeignKey("users.id"))
    mode = Column(String, default="normal_chat") # e.g. interview, ielts, debate
    topic = Column(String, nullable=True)
    
    duration_seconds = Column(Integer, default=0)
    
    # Scores (out of 10)
    score_fluency = Column(Float, nullable=True)
    score_grammar = Column(Float, nullable=True)
    score_vocabulary = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True) # UUID
    conversation_id = Column(String, ForeignKey("conversations.id"))
    
    role = Column(String) # "user" or "ai"
    content = Column(String) # Transcript or AI response
    
    # Analysis
    grammar_corrections = Column(JSON, nullable=True) # Array of corrections
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    conversation = relationship("Conversation", back_populates="messages")
