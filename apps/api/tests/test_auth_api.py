import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from pydantic import ValidationError

from app.main import app
from app.db.models import Base, User
from app.db.session import get_db
from app.core.security import hash_password
from app.schemas.schemas import UserLogin
from app.api.v1.auth import login


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
    """Create a user with a REAL bcrypt hash so verify_password can validate it."""
    u = User(
        username="testuser",
        email="test@example.com",
        password_hash=hash_password("testpass123"),
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
        password_hash=hash_password("testpass123"),
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
