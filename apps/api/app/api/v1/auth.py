from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_
import secrets
from datetime import datetime, timezone, timedelta
from app.db.session import get_db
from app.db.models import User
from app.schemas.schemas import UserCreate, UserLogin, TokenResponse, UserResponse, ForgotPasswordRequest, ResetPasswordConfirmRequest, ForgotPasswordResponse
from app.core.security import verify_password, hash_password, create_access_token
from app.core.config import get_settings
from app.services.notification_service import send_password_reset_email
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
    # Query by username or email depending on what was provided
    if data.username:
        user = db.query(User).filter(User.username == data.username).first()
    else:
        user = db.query(User).filter(User.email == data.email).first()
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


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generate a password reset token and send reset email."""
    user = db.query(User).filter(User.email == data.email).first()
    # Always return success to prevent email enumeration
    if not user:
        return ForgotPasswordResponse()

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    user.reset_token = token
    user.reset_token_expires_at = expires_at
    db.commit()

    settings = get_settings()
    reset_link = f"{settings.FRONTEND_URL}/reset-password/{token}"
    send_password_reset_email(user.email, reset_link)

    return ForgotPasswordResponse()


@router.post("/reset-password", response_model=TokenResponse)
def reset_password(data: ResetPasswordConfirmRequest, db: Session = Depends(get_db)):
    """Validate the reset token and update the user's password."""
    user = db.query(User).filter(User.reset_token == data.token).first()

    if not user or not user.reset_token_expires_at:
        raise HTTPException(400, "Invalid or expired reset token")

    if datetime.now(timezone.utc) > user.reset_token_expires_at:
        raise HTTPException(400, "Reset token has expired")

    if len(data.new_password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")

    user.password_hash = hash_password(data.new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    token_response = _create_token_response(user)
    response = Response()
    _set_auth_cookie(response, token_response.access_token)
    return token_response
