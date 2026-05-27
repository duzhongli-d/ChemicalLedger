import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.models import Base
from app.db.session import get_db


@pytest.fixture
def db():
    """In-memory SQLite DB for testing."""
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
        engine.dispose()


@pytest.fixture
def client(db):
    """TestClient with in-memory DB dependency override."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    c = TestClient(app)
    try:
        yield c
    finally:
        app.dependency_overrides.clear()


def test_contact_submit_success(client):
    """Valid contact form submission should return 200 with id and message."""
    with patch('app.api.v1.contact.send_contact_email') as mock_email:
        response = client.post("/api/v1/contact/", json={
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test subject",
            "category": "support",
            "message": "This is a test message for the contact form",
        })
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["message"] == "Submission received"
        # Verify email was sent
        mock_email.assert_called_once_with(
            name="Test User",
            email="test@example.com",
            category="support",
            subject="Test subject",
            message="This is a test message for the contact form",
        )


def test_contact_submit_validation_error(client):
    """Invalid contact form submission should return 422."""
    response = client.post("/api/v1/contact/", json={
        "name": "",
        "email": "bad-email",
        "subject": "",
        "category": "invalid",
        "message": "short",
    })
    assert response.status_code == 422
