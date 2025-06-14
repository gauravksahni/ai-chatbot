from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class MessageBase(BaseModel):
    role: str
    content: str


class MessageCreate(MessageBase):
    pass


class Message(MessageBase):
    id: str
    timestamp: datetime
    
    class Config:
        from_attributes = True


class ChatSessionBase(BaseModel):
    title: Optional[str] = None


class ChatSessionCreate(ChatSessionBase):
    pass


class ChatSessionUpdate(ChatSessionBase):
    title: Optional[str] = None


class ChatSession(ChatSessionBase):
    id: str = Field(..., alias="session_id")  # This is the fix
    user_id: int
    created_at: datetime
    updated_at: datetime
    messages: List[Message] = []
    
    class Config:
        from_attributes = True
        validate_by_name = True  # Required for alias to work

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    message: str
    session_id: str


class ChatHistory(BaseModel):
    sessions: List[ChatSession] = []