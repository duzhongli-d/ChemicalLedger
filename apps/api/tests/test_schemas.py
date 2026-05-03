import pytest
from app.schemas.schemas import ContactSubmissionCreate, ContactSubmissionResponse

def test_contact_submission_create_schema():
    data = {
        "name": "Test User",
        "email": "test@example.com",
        "subject": "Test",
        "category": "support",
        "message": "Test message content here",
    }
    schema = ContactSubmissionCreate(**data)
    assert schema.name == "Test User"
    assert schema.category == "support"

def test_contact_submission_create_validates_email():
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        ContactSubmissionCreate(
            name="Test",
            email="not-an-email",
            subject="Test",
            category="support",
            message="Test message",
        )

def test_contact_submission_category_validation():
    """Test that invalid category is rejected"""
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        ContactSubmissionCreate(
            name="Test",
            email="test@example.com",
            subject="Test",
            category="invalid_category",
            message="Test message content here",
        )

def test_contact_submission_message_too_short():
    """Test that message under 10 chars is rejected"""
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        ContactSubmissionCreate(
            name="Test",
            email="test@example.com",
            subject="Test",
            category="support",
            message="short",  # less than 10 chars
        )

def test_contact_submission_all_valid_categories():
    """Test all valid category values"""
    for cat in ["support", "technical", "feature", "business", "other"]:
        schema = ContactSubmissionCreate(
            name="Test",
            email="test@example.com",
            subject="Test",
            category=cat,
            message="Test message content",
        )
        assert schema.category == cat