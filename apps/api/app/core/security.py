from datetime import datetime, timedelta, timezone
from functools import lru_cache
from jose import jwt
from passlib.context import CryptContext
from .config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@lru_cache(maxsize=1)
def _get_settings_cached():
    return get_settings()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        # bcrypt may fail to load on Python 3.13 without a wheel.
        # Fail closed - return False (invalid credentials) instead of
        # propagating a 500 that would expose internal errors to API clients.
        return False


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    settings = _get_settings_cached()
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        settings = _get_settings_cached()
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.JWTError:
        return None
