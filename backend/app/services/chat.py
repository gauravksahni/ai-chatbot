import logging
import uuid
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any

from app.db.elasticsearch import (
    save_chat_session,
    get_chat_session,
    update_chat_session,
    get_chat_sessions_by_user,
    delete_chat_session,
)
from app.services.claude import claude_service

logger = logging.getLogger(__name__)

class ChatService:
    async def create_chat_session(self, user_id: int, title: Optional[str] = None) -> Dict[str, Any]:
        session_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        if not title:
            title = f"Chat {now}"
        chat_session = {
            "session_id": session_id,
            "user_id": user_id,
            "title": title,
            "messages": [],
            "created_at": now,
            "updated_at": now
        }
        save_chat_session(chat_session)
        logger.info(f"Created chat session {session_id} for user {user_id}")
        return chat_session

    async def get_user_chat_sessions(self, user_id: int) -> List[Dict[str, Any]]:
        return get_chat_sessions_by_user(user_id)

    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        return get_chat_session(session_id)

    async def delete_chat_session(self, session_id: str) -> bool:
        return delete_chat_session(session_id)

    async def add_message_to_session(self, session_id: str, role: str, content: str) -> Dict[str, Any]:
        session = get_chat_session(session_id)
        if not session:
            raise ValueError(f"Chat session {session_id} not found")
        message_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        message = {
            "id": message_id,
            "role": role,
            "content": content,
            "timestamp": timestamp
        }
        session.setdefault("messages", []).append(message)
        session["updated_at"] = timestamp
        save_chat_session(session)
        logger.info(f"Added {role} message to session {session_id}")
        return session

    async def update_chat_session(self, session_id: str, update_data: Dict[str, Any]) -> bool:
        return update_chat_session(session_id, update_data)

    async def process_user_message(self, user_id: int, message: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        try:
            if session_id:
                session = get_chat_session(session_id)
                if not session:
                    logger.warning(f"Session {session_id} not found, creating new session")
                    session = await self.create_chat_session(user_id)
            else:
                session = await self.create_chat_session(user_id)

            await self.add_message_to_session(session["session_id"], "user", message)
            chat_history = [{"role": msg["role"], "content": msg["content"]} for msg in session["messages"]]

            try:
                assistant_response = await asyncio.wait_for(
                    claude_service.chat(user_message=message, chat_history=chat_history[:-1]), timeout=20
                )
            except asyncio.TimeoutError:
                assistant_response = "[Timeout] Claude took too long to respond."

            await self.add_message_to_session(session["session_id"], "assistant", assistant_response)

            if len(session["messages"]) <= 2 and session["title"].startswith("Chat "):
                title = message[:30] + "..." if len(message) > 30 else message
                update_chat_session(session["session_id"], {"title": title})
                session["title"] = title

            logger.info(f"Processed message in session {session['session_id']}")
            return get_chat_session(session["session_id"])

        except Exception as e:
            logger.error(f"Error processing user message: {e}", exc_info=True)
            await self.add_message_to_session(session["session_id"], "system", f"Error: {str(e)}")
            raise