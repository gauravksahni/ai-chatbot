from datetime import timedelta
from typing import Optional
import logging

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_user_by_email,
)
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

logger = logging.getLogger(__name__)

class AuthService:
    def create_user(self, db: Session, user_in: UserCreate) -> User:
        """
        Create a new user.
        
        Args:
            db: Database session
            user_in: User creation data
            
        Returns:
            Created user
        """
        try:
            # Check if user with email or username exists
            existing_email_user = db.query(User).filter(User.email == user_in.email).first()
            if existing_email_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this email already exists",
                )
            
            existing_username_user = db.query(User).filter(User.username == user_in.username).first()
            if existing_username_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this username already exists",
                )
            
            # Create new user
            hashed_password = get_password_hash(user_in.password)
            user = User(
                email=user_in.email,
                username=user_in.username,
                hashed_password=hashed_password,
                is_active=True,
                is_superuser=False,  # Ignore user_in.is_superuser for security
            )
            
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Created new user: {user.username} ({user.id})")
            return user
            
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Database integrity error creating user: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Database integrity error. User could not be created.",
            )
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Unexpected error creating user: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected error: {str(e)}",
            )
    
    def authenticate(self, db: Session, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user.
        
        Args:
            db: Database session
            email: User email
            password: User password
            
        Returns:
            Authenticated user or None
        """
        try:
            user = get_user_by_email(db, email)
            if not user:
                return None
            if not verify_password(password, user.hashed_password):
                return None
            return user
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}", exc_info=True)
            return None
    
    def get_access_token(self, user_id: int) -> dict:
        """
        Generate a new access token for a user.
        
        Args:
            user_id: ID of the user
            
        Returns:
            Access token data
        """
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return {
            "access_token": create_access_token(
                subject=user_id, expires_delta=access_token_expires
            ),
            "token_type": "bearer",
        }
    
    def update_user(self, db: Session, user_id: int, user_in: UserUpdate) -> User:
        """
        Update a user.
        
        Args:
            db: Database session
            user_id: ID of the user to update
            user_in: User update data
            
        Returns:
            Updated user
        """
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found",
                )
            
            update_data = user_in.dict(exclude_unset=True)
            
            # Hash password if provided
            if "password" in update_data:
                update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
            
            # Update user
            for field, value in update_data.items():
                setattr(user, field, value)
            
            db.commit()
            db.refresh(user)
            return user
            
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Database integrity error updating user: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Database integrity error. User could not be updated.",
            )
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Unexpected error updating user: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected error: {str(e)}",
            )


# Singleton instance
auth_service = AuthService()