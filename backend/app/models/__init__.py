# Models package
# This file resolves circular dependencies between models

# Import SQLAlchemy relationship function
from sqlalchemy.orm import relationship

# First, import base and all models without relationships
from app.db.postgresql import Base
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage

# Now set up relationships after all models are defined
# This avoids circular import issues
User.chat_sessions = relationship("ChatSession", back_populates="user")
ChatSession.user = relationship("User", back_populates="chat_sessions")
ChatSession.messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
ChatMessage.session = relationship("ChatSession", back_populates="messages")