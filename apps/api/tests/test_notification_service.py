import pytest
from unittest.mock import patch


def test_send_contact_email_returns_false_without_api_key():
    """When SENDGRID_API_KEY is not set, returns False"""
    from app.services.notification_service import send_contact_email
    with patch('app.services.notification_service.get_settings') as mock_settings:
        mock_settings.return_value.SENDGRID_API_KEY = None
        result = send_contact_email(
            name="Test",
            email="test@example.com",
            category="support",
            subject="Test",
            message="Test message",
        )
        assert result is False
