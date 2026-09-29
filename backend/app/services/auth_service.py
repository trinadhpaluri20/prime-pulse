import logging
from typing import Tuple
from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, UserResponse, TokenResponse
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.utils.errors import ValidationErrorException, NotFoundError, AppException

logger = logging.getLogger(__name__)


class AuthService:
    """Service handling user registration, authentication, and token generation."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def register_user(self, data: UserCreate) -> TokenResponse:
        """Register a new user account and return JWT access token."""
        existing = self.repo.get_by_email(data.email)
        if existing:
            raise ValidationErrorException("An account with this email address already exists.")

        hashed = hash_password(data.password)
        user = self.repo.create(
            email=data.email,
            full_name=data.full_name,
            hashed_password=hashed,
        )
        logger.info(f"New user registered successfully: ID {user.id} ({user.email})")

        token = create_access_token({"sub": str(user.id), "email": user.email})
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    def authenticate_user(self, data: UserLogin) -> TokenResponse:
        """Authenticate user with email and password."""
        user = self.repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise ValidationErrorException("Invalid email or password.")

        if not user.is_active:
            raise ValidationErrorException("User account is inactive.")

        token = create_access_token({"sub": str(user.id), "email": user.email})
        logger.info(f"User authenticated successfully: ID {user.id}")
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    def get_current_user_from_token(self, token: str) -> UserResponse:
        """Decode JWT token and return authenticated user object."""
        payload = decode_access_token(token)
        if not payload or "sub" not in payload:
            raise AppException("Invalid or expired authentication token.", status_code=401)

        user_id = int(payload["sub"])
        user = self.repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise AppException("Authenticated user not found or inactive.", status_code=401)

        return UserResponse.model_validate(user)
