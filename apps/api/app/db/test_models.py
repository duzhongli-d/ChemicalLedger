import pytest
from uuid import uuid4
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.db.models import Base, ContactSubmission, User
from app.core.security import hash_password


@pytest.fixture
def db():
    """In-memory SQLite DB for testing — no external DB required."""
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


@pytest.fixture
def user(db):
    u = User(
        username="testuser",
        email="test@test.com",
        password_hash=hash_password("password"),
    )
    db.add(u)
    db.flush()
    return u


def test_contact_submission_model_fields(db, user):
    sub = ContactSubmission(
        id=uuid4(),
        user_id=user.id,
        name="Test User",
        email="test@example.com",
        subject="Test subject",
        category="support",
        message="This is a test message",
    )
    db.add(sub)
    db.flush()
    assert sub.name == "Test User"
    assert sub.email == "test@example.com"
    assert sub.category == "support"
    assert sub.is_read is False
