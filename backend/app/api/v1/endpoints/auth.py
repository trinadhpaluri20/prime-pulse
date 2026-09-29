from fastapi import APIRouter, Depends, Header, status
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.schemas.auth import UserCreate, UserLogin, UserResponse, TokenResponse
from app.services.auth_service import AuthService
from app.utils.errors import AppException

router = APIRouter()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account."""
    auth_service = AuthService(db)
    return auth_service.register_user(data)


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate existing user and return access token."""
    auth_service = AuthService(db)
    return auth_service.authenticate_user(data)


@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_me(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Retrieve details for the current authenticated user."""
    if not authorization or not authorization.startswith("Bearer "):
        raise AppException("Missing or invalid Authorization header.", status_code=401)

    token = authorization.split(" ", 1)[1]
    auth_service = AuthService(db)
    return auth_service.get_current_user_from_token(token)
