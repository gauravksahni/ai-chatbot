from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union
import logging

import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.schemas.user import TokenPayload

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def create_access_token(subject: Union[str, int], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    """
    try:
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode = {"exp": expire, "sub": str(subject)}
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt
    except Exception as e:
        logger.error(f"Error creating access token: {e}", exc_info=True)
        raise

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash.
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Error verifying password: {e}", exc_info=True)
        return False

def get_password_hash(password: str) -> str:
    """
    Hash a password.
    """
    try:
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"Error hashing password: {e}", exc_info=True)
        raise

def decode_jwt_token(token: str) -> Dict[str, Any]:
    """
    Decode a JWT token.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError as e:
        logger.warning(f"JWTError: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Unexpected error decoding JWT token: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Get a user by email.
    """
    try:
        return db.query(User).filter(User.email == email).first()
    except Exception as e:
        logger.error(f"Error getting user by email: {e}", exc_info=True)
        return None

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user.
    """
    try:
        user = get_user_by_email(db, email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user
    except Exception as e:
        logger.error(f"Error authenticating user: {e}", exc_info=True)
        return None
