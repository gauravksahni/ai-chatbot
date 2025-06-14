import logging
import json
from typing import Dict, List, Any, Optional

import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"


class ClaudeService:
    def __init__(self, api_key: str = settings.CLAUDE_API_KEY, model: str = settings.CLAUDE_MODEL):
        self.api_key = api_key
        self.model = model
        self.headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
    
    async def generate_response(
        self, messages: List[Dict[str, str]], max_tokens: int = 1024
    ) -> Dict[str, Any]:
        """
        Generate a response from Claude.
        
        Args:
            messages: A list of message objects with role and content
            max_tokens: Maximum number of tokens to generate
            
        Returns:
            Dict containing the assistant's response
        """
        # Format messages for Claude API
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    ANTHROPIC_API_URL,
                    headers=self.headers,
                    json={
                        "model": self.model,
                        "messages": messages,
                        "max_tokens": max_tokens
                    }
                )
                response.raise_for_status()
                result = response.json()
                logger.info(f"Claude response received, id: {result.get('id')}")
                return result
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error when calling Claude API: {e}")
            try:
                error_detail = e.response.json()
                logger.error(f"API error details: {error_detail}")
            except Exception:
                logger.error(f"API response: {e.response.text}")
            raise
        except httpx.RequestError as e:
            logger.error(f"Request error when calling Claude API: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error when calling Claude API: {e}")
            raise

    async def chat(
        self, user_message: str, chat_history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Send a message to Claude and get a response, with optional chat history.
        
        Args:
            user_message: The user's message
            chat_history: Optional list of previous messages
            
        Returns:
            The assistant's response text
        """
        messages = chat_history or []
        messages.append({"role": "user", "content": user_message})

        # Remove messages over token limit if needed (simplified)
        # In a real app, you'd implement more sophisticated token management
        if len(messages) > 10:
            messages = messages[-10:]
        
        result = await self.generate_response(messages)
        assistant_message = result.get("content", [{"text": "No response received"}])[0]["text"]
        
        return assistant_message


# Singleton instance
claude_service = ClaudeService()