import json
import logging
from typing import Dict, List, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
import jwt
import asyncio

from app.core.security import decode_jwt_token
from app.models.user import User
from app.db.postgresql import SessionLocal
from app.services.chat import ChatService

router = APIRouter()
logger = logging.getLogger(__name__)

connections: Dict[int, List[WebSocket]] = {}
chat_service = ChatService()

async def get_current_user_ws(token: str) -> Optional[User]:
    try:
        payload = decode_jwt_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return None

        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == int(user_id)).first()
            if not user or not user.is_active:
                return None
            return user
        finally:
            db.close()
    except jwt.PyJWTError:
        return None
    except Exception as e:
        logger.error(f"WebSocket authentication error: {e}", exc_info=True)
        return None

@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    logger.info(f"WebSocket connection attempt with token: {token[:10]}...")
    user = await get_current_user_ws(token)
    if not user:
        logger.warning(f"WebSocket authentication failed for token: {token[:10]}...")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    logger.info(f"WebSocket user authenticated: {user.username} (ID: {user.id})")

    try:
        await websocket.accept()
        logger.info(f"WebSocket connection accepted for user {user.id}")
    except Exception as e:
        logger.error(f"Error accepting WebSocket connection: {e}", exc_info=True)
        return

    if user.id not in connections:
        connections[user.id] = []
    connections[user.id].append(websocket)

    ping_task = None

    try:
        await websocket.send_json({"type": "connection_established", "message": "WebSocket connection established"})

        async def send_ping():
            while True:
                await asyncio.sleep(25)
                try:
                    if websocket.client_state.name == "CONNECTED":
                        await websocket.send_json({"type": "ping"})
                except Exception:
                    break

        ping_task = asyncio.create_task(send_ping())

        while True:
            try:
                data = await websocket.receive_text()
                logger.info(f"WebSocket message received from user {user.id}")
            except WebSocketDisconnect:
                logger.info(f"WebSocket client disconnected normally: User {user.id}")
                raise
            except Exception as e:
                logger.error(f"Error receiving WebSocket message: {e}", exc_info=True)
                try:
                    await websocket.send_json({"type": "error", "message": "Connection error, please try again"})
                    await asyncio.sleep(1)
                    continue
                except:
                    break

            try:
                message_data = json.loads(data)

                if message_data.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                    continue

                user_message = message_data.get("message")
                session_id = message_data.get("session_id")

                if not user_message:
                    await websocket.send_json({"error": "Message content is required"})
                    continue

                logger.info(f"Processing WebSocket message for user {user.id}, session: {session_id}")
                session = await chat_service.process_user_message(
                    user_id=user.id,
                    message=user_message,
                    session_id=session_id
                )

                assistant_messages = [msg for msg in session["messages"] if msg["role"] == "assistant"]
                assistant_response = assistant_messages[-1]["content"] if assistant_messages else "No response received"
                timestamp = assistant_messages[-1]["timestamp"] if assistant_messages else None

                logger.debug(f"Sending to WebSocket: {assistant_response=} session_id={session['session_id']}")

                try:
                    await websocket.send_json({
                        "message": assistant_response,
                        "session_id": session["session_id"],
                        "timestamp": timestamp
                    })
                except Exception as e:
                    logger.error(f"Failed to send message to WebSocket: {e}", exc_info=True)
                    await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
                    return

                logger.info(f"WebSocket response sent to user {user.id}")

            except json.JSONDecodeError:
                logger.error(f"Invalid JSON format from user {user.id}")
                await websocket.send_json({"error": "Invalid JSON format"})
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {e}", exc_info=True)
                await websocket.send_json({"error": f"Error processing message: {str(e)}"})

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected: User {user.id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
    finally:
        if ping_task:
            ping_task.cancel()
        if user.id in connections and websocket in connections[user.id]:
            connections[user.id].remove(websocket)
            if not connections[user.id]:
                del connections[user.id]