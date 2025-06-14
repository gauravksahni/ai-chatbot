import time
from typing import Dict, Tuple
from fastapi import HTTPException, Request, status
from app.core.config import settings

# In-memory storage for rate limiting
# In production, use Redis or another distributed store
rate_limit_storage: Dict[str, Tuple[int, float]] = {}


def get_rate_limit_key(request: Request) -> str:
    """
    Generate a rate limit key based on client IP and endpoint.
    
    Args:
        request: FastAPI request object
        
    Returns:
        Rate limit key
    """
    # Get the client IP
    client_ip = request.client.host if request.client else "unknown"
    
    # Get the endpoint
    endpoint = request.url.path
    
    # Combine to create a unique key
    return f"{client_ip}:{endpoint}"


def check_rate_limit(request: Request) -> None:
    """
    Check if the request exceeds rate limits.
    
    Args:
        request: FastAPI request object
        
    Raises:
        HTTPException: If rate limit is exceeded
    """
    rate_limit_key = get_rate_limit_key(request)
    current_time = time.time()
    
    # Get rate limit data for this key
    count, start_time = rate_limit_storage.get(rate_limit_key, (0, current_time))
    
    # Check if the time window has expired
    time_window = 60  # seconds (1 minute)
    if current_time - start_time > time_window:
        # Reset the counter for a new time window
        count = 0
        start_time = current_time
    
    # Check if the rate limit is exceeded
    if count >= settings.RATE_LIMIT_PER_MINUTE:
        remaining_time = time_window - (current_time - start_time)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again in {int(remaining_time)} seconds.",
            headers={"Retry-After": str(int(remaining_time))},
        )
    
    # Update the rate limit counter
    rate_limit_storage[rate_limit_key] = (count + 1, start_time)