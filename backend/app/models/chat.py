from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.sql import func

from app.db.postgresql import Base


class ChatSession(Base):
    """
    SQLAlchemy model for a chat session.
    
    Note: While chat sessions and messages are primarily stored in Elasticsearch,
    we maintain a lightweight reference table in PostgreSQL for relational queries,
    access control, and to handle cases where Elasticsearch might be temporarily unavailable.
    """
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships are set in __init__.py
    # user = relationship("User", back_populates="chat_sessions")
    # messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
    """
    SQLAlchemy model for individual chat messages.
    
    This model maintains a reference to messages stored in Elasticsearch,
    but doesn't store the full message content to avoid duplication.
    """
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String, unique=True, index=True, nullable=False)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String, nullable=False)  # 'user', 'assistant', or 'system'
    # Store a preview/truncated version of the content for quick access
    content_preview = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship is set in __init__.py
    # session = relationship("ChatSession", back_populates="messages")