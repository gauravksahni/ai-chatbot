from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse

from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChatHistory,
    ChatSession,
    ChatSessionCreate,
    ChatSessionUpdate,
)
from app.services.chat import ChatService
from app.utils.rate_limiter import check_rate_limit

router = APIRouter()
chat_service = ChatService()


@router.get("/history", response_model=ChatHistory)
async def get_chat_history(
    request: Request,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get chat history for the current user.
    """
    check_rate_limit(request)
    
    sessions = await chat_service.get_user_chat_sessions(current_user.id)
    return {"sessions": sessions}


@router.post("/sessions", response_model=ChatSession)
async def create_session(
    request: Request,
    session_in: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new chat session.
    """
    check_rate_limit(request)
    
    session = await chat_service.create_chat_session(
        user_id=current_user.id,
        title=session_in.title,
    )
    return session


@router.get("/sessions/{session_id}", response_model=ChatSession)
async def get_session(
    request: Request,
    session_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a specific chat session.
    """
    check_rate_limit(request)
    
    session = await chat_service.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )
    
    # Ensure the session belongs to the current user
    if session["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this chat session",
        )
    
    return session


@router.put("/sessions/{session_id}", response_model=ChatSession)
async def update_session(
    request: Request,
    session_id: str,
    session_in: ChatSessionUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a chat session.
    """
    check_rate_limit(request)
    
    # Check if session exists and belongs to user
    session = await chat_service.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )
    
    if session["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this chat session",
        )
    
    # Update session
    update_data = session_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        session[field] = value
    
    await chat_service.update_chat_session(session_id, update_data)
    return await chat_service.get_session(session_id)


@router.delete("/sessions/{session_id}", response_model=dict)
async def delete_session(
    request: Request,
    session_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a chat session.
    """
    check_rate_limit(request)
    
    # Check if session exists and belongs to user
    session = await chat_service.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )
    
    if session["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this chat session",
        )
    
    # Delete session
    result = await chat_service.delete_chat_session(session_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete chat session",
        )
    
    return {"success": True, "message": "Chat session deleted successfully"}


@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: Request,
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Send a message to Claude and get a response.
    """
    check_rate_limit(request)
    
    # Verify session if provided
    if chat_request.session_id:
        session = await chat_service.get_session(chat_request.session_id)
        if session and session["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this chat session",
            )
    
    try:
        # Process the message
        session = await chat_service.process_user_message(
            user_id=current_user.id,
            message=chat_request.message,
            session_id=chat_request.session_id
        )
        
        # Get the assistant's message (last message in the session)
        if session["messages"]:
            assistant_messages = [
                msg for msg in session["messages"] if msg["role"] == "assistant"
            ]
            if assistant_messages:
                assistant_response = assistant_messages[-1]["content"]
            else:
                assistant_response = "No response received"
        else:
            assistant_response = "No response received"
        
        return {
            "message": assistant_response,
            "session_id": session["session_id"]
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": f"Error processing message: {str(e)}"}
        )