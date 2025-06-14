from typing import Any, Dict, List, Optional
import json
import logging
from elasticsearch import Elasticsearch
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Elasticsearch client
es_client = None


def get_elasticsearch_client() -> Optional[Elasticsearch]:
    """Get or create Elasticsearch client."""
    global es_client
    if es_client is None:
        try:
            # Create a basic client without extra parameters
            es_client = Elasticsearch(
                [f"http://{settings.ELASTICSEARCH_HOST}:{settings.ELASTICSEARCH_PORT}"]
            )
            
            # Check if the client is connected
            if es_client.ping():
                logger.info("Successfully connected to Elasticsearch")
                # Initialize index
                _ensure_index_exists(es_client)
            else:
                logger.error("Failed to ping Elasticsearch")
                es_client = None
        except Exception as e:
            logger.error(f"Failed to initialize Elasticsearch: {e}", exc_info=True)
            es_client = None
    
    return es_client


def _ensure_index_exists(es: Elasticsearch) -> None:
    """Create index if it doesn't exist."""
    index_name = settings.CHAT_INDEX_NAME
    
    try:
        # Check if index exists
        if not es.indices.exists(index=index_name):
            # Create a basic index first
            body = {
                "settings": {
                    "number_of_shards": 1,
                    "number_of_replicas": 0
                }
            }
            es.indices.create(index=index_name, body=body)
            logger.info(f"Created index: {index_name}")
            
            # Update mappings
            mapping_body = {
                "properties": {
                    "user_id": {"type": "integer"},
                    "session_id": {"type": "keyword"},
                    "title": {"type": "text"},
                    "messages": {
                        "type": "nested",
                        "properties": {
                            "id": {"type": "keyword"},
                            "role": {"type": "keyword"},
                            "content": {"type": "text"},
                            "timestamp": {"type": "date"}
                        }
                    },
                    "created_at": {"type": "date"},
                    "updated_at": {"type": "date"}
                }
            }
            es.indices.put_mapping(body=mapping_body, index=index_name)
            logger.info(f"Added mappings to {index_name}")
    except Exception as e:
        logger.error(f"Error setting up index: {e}", exc_info=True)


def save_chat_session(chat_session: Dict[str, Any]) -> None:
    """Save a chat session to Elasticsearch."""
    try:
        es = get_elasticsearch_client()
        if not es:
            logger.error("Elasticsearch client not available")
            raise Exception("Elasticsearch not available")
            
        # Use index API for ES 8.x
        result = es.index(
            index=settings.CHAT_INDEX_NAME,
            id=chat_session["session_id"],
            body=chat_session,
            refresh=True
        )
        logger.info(f"Saved chat session: {result.get('result', 'unknown')}")
    except Exception as e:
        logger.error(f"Failed to save chat session: {e}")
        raise


def get_chat_sessions_by_user(user_id: int) -> List[Dict[str, Any]]:
    """Get all chat sessions for a user."""
    try:
        es = get_elasticsearch_client()
        if not es:
            logger.warning("Elasticsearch client not available for getting chat sessions")
            return []
            
        body = {
            "query": {
                "term": {"user_id": user_id}
            },
            "sort": [{"updated_at": {"order": "desc"}}],
            "size": 100
        }
        result = es.search(index=settings.CHAT_INDEX_NAME, body=body)
        return [hit["_source"] for hit in result["hits"]["hits"]]
    except Exception as e:
        logger.error(f"Failed to get chat sessions: {e}")
        return []


def get_chat_session(session_id: str) -> Optional[Dict[str, Any]]:
    """Get a specific chat session by its ID."""
    try:
        es = get_elasticsearch_client()
        if not es:
            logger.warning(f"Elasticsearch client not available for getting session {session_id}")
            return None
            
        try:
            result = es.get(index=settings.CHAT_INDEX_NAME, id=session_id)
            return result["_source"]
        except Exception as not_found_err:
            if "404" in str(not_found_err):
                return None
            raise
    except Exception as e:
        logger.error(f"Failed to get chat session: {e}")
        return None


def update_chat_session(session_id: str, update_data: Dict[str, Any]) -> None:
    """Update fields in a chat session."""
    try:
        es = get_elasticsearch_client()
        if not es:
            logger.error("Elasticsearch client not available for updating")
            raise Exception("Elasticsearch not available")
            
        body = {
            "doc": update_data
        }
        result = es.update(
            index=settings.CHAT_INDEX_NAME,
            id=session_id,
            body=body,
            refresh=True
        )
        logger.info(f"Updated chat session: {result.get('result', 'unknown')}")
    except Exception as e:
        logger.error(f"Failed to update chat session: {e}")
        raise


def delete_chat_session(session_id: str) -> bool:
    """Delete a chat session."""
    try:
        es = get_elasticsearch_client()
        if not es:
            logger.error("Elasticsearch client not available for deletion")
            return False
            
        result = es.delete(index=settings.CHAT_INDEX_NAME, id=session_id, refresh=True)
        logger.info(f"Deleted chat session: {result.get('result', 'unknown')}")
        return True
    except Exception as e:
        if "404" in str(e):
            return False
        logger.error(f"Failed to delete chat session: {e}")
        return False