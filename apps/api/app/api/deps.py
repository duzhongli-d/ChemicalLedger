from fastapi import Depends, HTTPException, status, Request, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.db.models import User, UserRole
from app.core.security import decode_access_token

security = HTTPBearer(auto_error=False)  # Don't auto-fail, we handle missing tokens
COOKIE_NAME = "access_token"


def _get_token_from_request(request: Request) -> Optional[str]:
    """Extract token from cookie first, fall back to Authorization header."""
    # Try cookie first (HttpOnly, set by login)
    token = request.cookies.get(COOKIE_NAME)
    if token:
        return token
    # Fall back to Bearer token (for legacy clients/axios)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]
    return None


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User | None:
    """Get current user from cookie or Bearer token."""
    token = _get_token_from_request(request)
    if not token:
        return None
    payload = decode_access_token(token)
    if payload is None:
        return None
    user_id = payload.get("sub")
    if user_id is None:
        return None
    return db.query(User).filter(User.id == user_id).first()


def get_current_user_required(
    current_user: User | None = Depends(get_current_user),
) -> User:
    if current_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return current_user


def get_admin_user(current_user: User = Depends(get_current_user_required)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin required")
    return current_user
