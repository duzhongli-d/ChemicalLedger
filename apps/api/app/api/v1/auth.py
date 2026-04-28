from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timezone
from app.db.session import get_db
from app.db.models import User
from app.schemas.schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from app.core.security import verify_password, hash_password, create_access_token
from app.api.deps import get_current_user_required

router = APIRouter()

COOKIE_NAME = "access_token"


def _create_token_response(user: User) -> TokenResponse:
    """Create token response for a user."""
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


def _set_auth_cookie(response: Response, token: str) -> None:
    """Set HTTP-only auth cookie on response."""
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=60 * 60 * 24 * 7,  # 7 days
    )


@router.post("/register", response_model=TokenResponse)
def register(data: UserCreate, db: Session = Depends(get_db), response: Response = None):
    existing = db.query(User).filter(or_(User.username == data.username, User.email == data.email)).first()
    if existing:
        if existing.username == data.username:
            raise HTTPException(400, "Username already exists")
        raise HTTPException(400, "Email already exists")
    user = User(
        username=data.username,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token_response = _create_token_response(user)
    if response:
        _set_auth_cookie(response, token_response.access_token)
    return token_response


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db), response: Response = None):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    token_response = _create_token_response(user)
    if response:
        _set_auth_cookie(response, token_response.access_token)
    return token_response


@router.post("/logout")
def logout(response: Response):
    """Clear auth cookie to log out user."""
    response.delete_cookie(key=COOKIE_NAME)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user_required)):
    return UserResponse.model_validate(current_user)
