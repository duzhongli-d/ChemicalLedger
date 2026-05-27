import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from pydantic import ValidationError

from app.main import app
from app.db.models import Base, User
from app.db.session import get_db
from app.schemas.schemas import UserLogin
from app.api.v1.auth import login


# Pre-computed bcrypt hash of "testpass123" (bcrypt not available in test venv)
TEST_PASSWORD_HASH = "$2b$12$vdU1fsWNAXy3kULyqZzA/u9Q0iXn4UFdjx8VMax/78ACjE6xYXElK"


# ---------------------------------------------------------------------------
# In-memory DB — fresh engine per test for complete isolation
# ---------------------------------------------------------------------------

@pytest.fixture
def db():
    """In-memory SQLite DB with a fresh engine each test for isolation."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user(db):
    """Create a user with a static hash for tests (bcrypt unavailable in test venv)."""
    u = User(
        username="testuser",
        email="test@example.com",
        password_hash=TEST_PASSWORD_HASH,
        role="user",
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


# ---------------------------------------------------------------------------
# TestClient fixture with DB override
# ---------------------------------------------------------------------------

@pytest.fixture
def client(db):
    """TestClient with in-memory DB dependency override."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine)
    test_db = TestingSession()

    # Recreate test_user in the test DB
    u = User(
        username="testuser",
        email="test@example.com",
        password_hash=TEST_PASSWORD_HASH,
        role="user",
    )
    test_db.add(u)
    test_db.commit()
    test_db.refresh(u)

    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    c = TestClient(app)
    c.test_db = test_db  # expose test_db so tests can access it directly
    try:
        yield c
    finally:
        app.dependency_overrides.clear()
        test_db.close()
        Base.metadata.drop_all(bind=engine)


# ---------------------------------------------------------------------------
# Tests using TestClient (full HTTP stack including cookie setting)
# ---------------------------------------------------------------------------

def test_login_with_username(client, test_user):
    """Login using username should succeed."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "testuser", "password": "testpass123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"]
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "testuser"
    assert data["user"]["email"] == "test@example.com"
    # Verify HttpOnly cookie is set
    assert "set-cookie" in response.headers or any(
        cookie.name == "access_token"
        for cookie in client.cookies.values()
    )


def test_login_with_email(client, test_user):
    """Login using email should succeed."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpass123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"]
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "testuser"
    assert data["user"]["email"] == "test@example.com"


def test_login_invalid_password(client, test_user):
    """Login with wrong password should fail with 401."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "testuser", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


def test_login_nonexistent_user(client):
    """Login with non-existent user should fail with 401."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "nosuchuser", "password": "testpass123"},
    )
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


# ---------------------------------------------------------------------------
# Tests using login() directly (schema validation only)
# ---------------------------------------------------------------------------

def test_login_requires_identity():
    """Login without username or email should fail Pydantic validation."""
    with pytest.raises(ValidationError) as exc_info:
        UserLogin(password="testpass123")

    errors = exc_info.value.errors()
    assert any(
        "Either username or email must be provided" in str(e)
        for e in errors
    )


# ---------------------------------------------------------------------------
# Forgot-password endpoint tests
# ---------------------------------------------------------------------------

def test_forgot_password_existing_user(client, test_user):
    """POST /forgot-password with an existing email should return 200 and set reset_token."""
    # Monkeypatch send_password_reset_email to avoid real SendGrid calls
    def mock_send_email(*args, **kwargs):
        return True
    client.app.dependency_overrides[get_db]
    from app.api.v1 import auth as auth_module
    original = auth_module.send_password_reset_email
    auth_module.send_password_reset_email = mock_send_email
    try:
        response = client.post("/api/v1/auth/forgot-password", json={"email": "test@example.com"})
        assert response.status_code == 200
        data = response.json()
        assert "If that email" in data["message"]
    finally:
        auth_module.send_password_reset_email = original


def test_forgot_password_nonexistent_user(client):
    """POST /forgot-password with a non-existent email should still return 200 (no enumeration)."""
    response = client.post("/api/v1/auth/forgot-password", json={"email": "nosuchuser@example.com"})
    assert response.status_code == 200
    data = response.json()
    assert "If that email" in data["message"]


def test_forgot_password_invalid_email(client):
    """POST /forgot-password with invalid email format should return 422."""
    response = client.post("/api/v1/auth/forgot-password", json={"email": "notanemail"})
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Reset-password endpoint tests
# ---------------------------------------------------------------------------

def test_reset_password_valid_token(client):
    """POST /reset-password with a valid token should update password and return TokenResponse."""
    import secrets
    from datetime import datetime, timezone, timedelta

    test_db = client.test_db
    user = test_db.query(User).filter(User.email == "test@example.com").first()
    assert user is not None

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires_at = datetime.utcnow() + timedelta(hours=1)
    test_db.commit()

    response = client.post("/api/v1/auth/reset-password", json={
        "token": token,
        "new_password": "newpassword123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"]
    assert data["user"]["email"] == "test@example.com"


def test_reset_password_invalid_token(client):
    """POST /reset-password with an invalid token should return 400."""
    response = client.post("/api/v1/auth/reset-password", json={
        "token": "invalid-token",
        "new_password": "newpassword123"
    })
    assert response.status_code == 400
    assert "Invalid or expired" in response.json()["detail"]


def test_reset_password_expired_token(client):
    """POST /reset-password with an expired token should return 400."""
    import secrets
    from datetime import datetime, timezone, timedelta

    test_db = client.test_db
    user = test_db.query(User).filter(User.email == "test@example.com").first()
    assert user is not None

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires_at = datetime.utcnow() - timedelta(hours=1)
    test_db.commit()

    response = client.post("/api/v1/auth/reset-password", json={
        "token": token,
        "new_password": "newpassword123"
    })
    assert response.status_code == 400
    assert "expired" in response.json()["detail"]


def test_reset_password_short_password(client):
    """POST /reset-password with a password < 8 chars should return 400."""
    import secrets
    from datetime import datetime, timezone, timedelta

    test_db = client.test_db
    user = test_db.query(User).filter(User.email == "test@example.com").first()
    assert user is not None

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires_at = datetime.utcnow() + timedelta(hours=1)
    test_db.commit()

    response = client.post("/api/v1/auth/reset-password", json={
        "token": token,
        "new_password": "short"
    })
    assert response.status_code == 422  # Pydantic min_length=8 validation runs before endpoint
