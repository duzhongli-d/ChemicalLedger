import pytest
from unittest.mock import patch
from datetime import date, timedelta, datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.db.models import Base, Category, User, Ledger


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
def category(db):
    cat = Category(
        level1="实验用溶液",
        level2="一般限度试验用溶液",
        warning_threshold_days=30,
        unopened_shelf_months=6,
        opened_shelf_months=3,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@pytest.fixture
def user(db):
    u = User(
        username="testuser",
        email="test@test.com",
        password_hash="$2b$12$vdU1fsWNAXy3kULyqZzA/u9Q0iXn4UFdjx8VMax/78ACjE6xYXElK",
        role="user",
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def test_send_expiry_warning_email_returns_false_without_api_key():
    """When SENDGRID_API_KEY is not set, returns False"""
    from app.services.notification_service import send_expiry_warning_email
    with patch('app.services.notification_service.get_settings') as mock_settings:
        mock_settings.return_value.SENDGRID_API_KEY = None
        result = send_expiry_warning_email(
            user_email="user@example.com",
            ledger_name="乙醇",
            internal_batch_no="2026010001",
            expiry_date=date(2026, 6, 1),
            days_left=5,
        )
        assert result is False


def test_send_expiry_warning_email_returns_false_on_sendgrid_error():
    """When SendGrid raises an exception, returns False"""
    from app.services.notification_service import send_expiry_warning_email
    with patch('app.services.notification_service.get_settings') as mock_settings:
        mock_settings.return_value.SENDGRID_API_KEY = "fake-key"
        mock_settings.return_value.SENDGRID_FROM_EMAIL = "qc@abachem.com"
        with patch('sendgrid.SendGridAPIClient') as mock_sg:
            mock_sg.return_value.send.side_effect = Exception("SendGrid error")
            result = send_expiry_warning_email(
                user_email="user@example.com",
                ledger_name="乙醇",
                internal_batch_no="2026010001",
                expiry_date=date(2026, 6, 1),
                days_left=5,
            )
            assert result is False


def test_send_expiry_warning_email_returns_true_on_success():
    """When SendGrid succeeds, returns True"""
    from app.services.notification_service import send_expiry_warning_email
    with patch('app.services.notification_service.get_settings') as mock_settings:
        mock_settings.return_value.SENDGRID_API_KEY = "fake-key"
        mock_settings.return_value.SENDGRID_FROM_EMAIL = "qc@abachem.com"
        with patch('sendgrid.SendGridAPIClient') as mock_sg:
            mock_sg.return_value.send.return_value = None
            result = send_expiry_warning_email(
                user_email="user@example.com",
                ledger_name="乙醇",
                internal_batch_no="2026010001",
                expiry_date=date(2026, 6, 1),
                days_left=5,
            )
            assert result is True


def test_send_expiry_warning_email_uses_alert_level_when_days_left_le_7():
    """When days_left <= 7, subject contains '紧急' (alert level)"""
    from app.services.notification_service import send_expiry_warning_email
    captured_message = None

    def capture_send(message):
        nonlocal captured_message
        captured_message = message

    with patch('app.services.notification_service.get_settings') as mock_settings:
        mock_settings.return_value.SENDGRID_API_KEY = "fake-key"
        mock_settings.return_value.SENDGRID_FROM_EMAIL = "qc@abachem.com"
        with patch('sendgrid.SendGridAPIClient') as mock_sg:
            mock_sg.return_value.send.side_effect = capture_send
            send_expiry_warning_email(
                user_email="user@example.com",
                ledger_name="乙醇",
                internal_batch_no="2026010001",
                expiry_date=date(2026, 6, 1),
                days_left=3,
            )
            assert "紧急" in str(captured_message.subject)


def test_send_expiry_warning_email_uses_warning_level_when_days_g_7():
    """When days_left > 7, subject contains '预警' (warning level)"""
    from app.services.notification_service import send_expiry_warning_email
    captured_message = None

    def capture_send(message):
        nonlocal captured_message
        captured_message = message

    with patch('app.services.notification_service.get_settings') as mock_settings:
        mock_settings.return_value.SENDGRID_API_KEY = "fake-key"
        mock_settings.return_value.SENDGRID_FROM_EMAIL = "qc@abachem.com"
        with patch('sendgrid.SendGridAPIClient') as mock_sg:
            mock_sg.return_value.send.side_effect = capture_send
            send_expiry_warning_email(
                user_email="user@example.com",
                ledger_name="乙醇",
                internal_batch_no="2026010001",
                expiry_date=date(2026, 6, 1),
                days_left=15,
            )
            assert "预警" in str(captured_message.subject)
            assert "紧急" not in str(captured_message.subject)


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


def test_send_contact_reply_email_returns_false_without_api_key():
    """When SENDGRID_API_KEY is not set, returns False"""
    from app.services.notification_service import send_contact_reply_email
    with patch('app.services.notification_service.get_settings') as mock_settings:
        mock_settings.return_value.SENDGRID_API_KEY = None
        result = send_contact_reply_email(
            user_email="user@example.com",
            user_name="Test User",
            subject="Test subject",
            reply_content="This is a reply.",
        )
        assert result is False


def test_send_contact_reply_email_returns_false_on_sendgrid_error():
    """When SendGrid raises an exception, returns False"""
    from app.services.notification_service import send_contact_reply_email
    with patch('app.services.notification_service.get_settings') as mock_settings:
        mock_settings.return_value.SENDGRID_API_KEY = "fake-key"
        mock_settings.return_value.SENDGRID_FROM_EMAIL = "qc@abachem.com"
        with patch('sendgrid.SendGridAPIClient') as mock_sg:
            mock_sg.return_value.send.side_effect = Exception("SendGrid error")
            result = send_contact_reply_email(
                user_email="user@example.com",
                user_name="Test User",
                subject="Test subject",
                reply_content="This is a reply.",
            )
            assert result is False


def test_send_contact_reply_email_returns_true_on_success():
    """When SendGrid succeeds, returns True"""
    from app.services.notification_service import send_contact_reply_email
    with patch('app.services.notification_service.get_settings') as mock_settings:
        mock_settings.return_value.SENDGRID_API_KEY = "fake-key"
        mock_settings.return_value.SENDGRID_FROM_EMAIL = "qc@abachem.com"
        with patch('sendgrid.SendGridAPIClient') as mock_sg:
            mock_sg.return_value.send.return_value = None
            result = send_contact_reply_email(
                user_email="user@example.com",
                user_name="Test User",
                subject="Test subject",
                reply_content="This is a reply.",
            )
            assert result is True


def test_send_password_reset_email_returns_false_without_api_key():
    """When SENDGRID_API_KEY is not set, returns False"""
    from app.services.notification_service import send_password_reset_email
    with patch('app.services.notification_service.get_settings') as mock_settings:
        mock_settings.return_value.SENDGRID_API_KEY = None
        result = send_password_reset_email(
            user_email="user@example.com",
            reset_link="https://example.com/reset?token=abc",
        )
        assert result is False


def test_send_password_reset_email_returns_false_on_sendgrid_error():
    """When SendGrid raises an exception, returns False"""
    from app.services.notification_service import send_password_reset_email
    with patch('app.services.notification_service.get_settings') as mock_settings:
        mock_settings.return_value.SENDGRID_API_KEY = "fake-key"
        mock_settings.return_value.SENDGRID_FROM_EMAIL = "qc@abachem.com"
        with patch('sendgrid.SendGridAPIClient') as mock_sg:
            mock_sg.return_value.send.side_effect = Exception("SendGrid error")
            result = send_password_reset_email(
                user_email="user@example.com",
                reset_link="https://example.com/reset?token=abc",
            )
            assert result is False


def test_send_password_reset_email_returns_true_on_success():
    """When SendGrid succeeds, returns True"""
    from app.services.notification_service import send_password_reset_email
    with patch('app.services.notification_service.get_settings') as mock_settings:
        mock_settings.return_value.SENDGRID_API_KEY = "fake-key"
        mock_settings.return_value.SENDGRID_FROM_EMAIL = "qc@abachem.com"
        with patch('sendgrid.SendGridAPIClient') as mock_sg:
            mock_sg.return_value.send.return_value = None
            result = send_password_reset_email(
                user_email="user@example.com",
                reset_link="https://example.com/reset?token=abc",
            )
            assert result is True


# --- check_and_create_notifications tests ---

def test_check_and_create_notifications_no_ledgers(db, category, user):
    """When no ledgers are near expiry, returns zeros"""
    from app.services.notification_service import check_and_create_notifications
    result = check_and_create_notifications(db)
    assert result["notified"] == 0
    assert result["emails_sent"] == 0
    assert result["skipped"] == 0


def test_check_and_create_notifications_ledger_near_expiry(db, category, user):
    """When a ledger is near expiry, creates notification and sends email"""
    from app.services.notification_service import check_and_create_notifications
    from app.db.models import Ledger

    today = date.today()
    ledger = Ledger(
        product_name="乙醇",
        internal_batch_no="2026010001",
        batch_no="ETH-001",
        cas_no="64-17-5",
        supplier="Sigma",
        weight_capacity="500mL",
        quantity=1,
        status="active",
        is_opened=False,
        effective_expiry_date=today + timedelta(days=15),
        category_id=category.id,
        created_by_id=user.id,
    )
    db.add(ledger)
    db.commit()

    with patch('app.services.notification_service.send_expiry_warning_email') as mock_email:
        mock_email.return_value = True
        result = check_and_create_notifications(db)

    assert result["notified"] == 1
    assert result["emails_sent"] == 1
    assert result["skipped"] == 0


def test_check_and_create_notifications_deduplicates_recent_notification(db, category, user):
    """When a notification was already sent in last 3 days, skips the ledger"""
    from app.services.notification_service import check_and_create_notifications
    from app.db.models import Ledger, Notification
    from datetime import datetime, timezone

    today = date.today()
    ledger = Ledger(
        product_name="乙醇",
        internal_batch_no="2026010001",
        batch_no="ETH-001",
        cas_no="64-17-5",
        supplier="Sigma",
        weight_capacity="500mL",
        quantity=1,
        status="active",
        is_opened=False,
        effective_expiry_date=today + timedelta(days=15),
        category_id=category.id,
        created_by_id=user.id,
    )
    db.add(ledger)
    db.commit()

    recent_notif = Notification(
        user_id=user.id,
        type="expiry_warning",
        title="🟡 台账预警：乙醇",
        content="...",
        ledger_id=ledger.id,
        sent_at=datetime.now(timezone.utc),
    )
    db.add(recent_notif)
    db.commit()

    with patch('app.services.notification_service.send_expiry_warning_email') as mock_email:
        result = check_and_create_notifications(db)

    assert result["skipped"] == 1
    assert result["notified"] == 0
    mock_email.assert_not_called()


def test_check_and_create_notifications_expired_ledger_skipped(db, category, user):
    """When ledger effective_expiry_date is in the past, it is skipped"""
    from app.services.notification_service import check_and_create_notifications
    from app.db.models import Ledger

    ledger = Ledger(
        product_name="乙醇",
        internal_batch_no="2026010001",
        batch_no="ETH-001",
        cas_no="64-17-5",
        supplier="Sigma",
        weight_capacity="500mL",
        quantity=1,
        status="active",
        is_opened=False,
        effective_expiry_date=date.today() - timedelta(days=5),
        category_id=category.id,
        created_by_id=user.id,
    )
    db.add(ledger)
    db.commit()

    with patch('app.services.notification_service.send_expiry_warning_email') as mock_email:
        result = check_and_create_notifications(db)

    assert result["notified"] == 0
    mock_email.assert_not_called()
