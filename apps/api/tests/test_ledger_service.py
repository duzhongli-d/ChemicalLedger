import pytest
import os
from datetime import date, datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.db.models import Base, Category, Ledger, User
from app.services.ledger_service import (
    generate_internal_batch_no,
    calculate_expiry_date,
    create_ledger,
    update_open_date,
)


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
        Base.metadata.drop_all(bind=engine)


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
    from app.core.security import hash_password
    u = User(
        username="testuser",
        email="test@test.com",
        password_hash=hash_password("password"),
        role="user",
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def test_generate_internal_batch_no_single(db, category, user):
    result = generate_internal_batch_no(db, 1)
    assert len(result) == 1
    assert len(result[0]) == 7  # YYYYMMM
    assert result[0].isdigit()


def test_generate_internal_batch_no_multiple(db, category, user):
    result = generate_internal_batch_no(db, 3)
    assert len(result) == 3
    assert all(len(r) == 9 for r in result)  # YYYYMMMNN


def test_calculate_expiry_unopened(db, category, user):
    expiry = calculate_expiry_date(
        db, category.id, datetime(2026, 1, 1), None, date(2030, 1, 1)
    )
    # Unopened: created Jan 1 2026 + 6 months = Jul 1 2026
    assert expiry == date(2026, 7, 1)


def test_calculate_expiry_opened(db, category, user):
    expiry = calculate_expiry_date(
        db, category.id, datetime(2026, 1, 1), date(2026, 2, 1), date(2030, 1, 1)
    )
    # Opened: opened Feb 1 2026 + 3 months opened_shelf = May 1 2026
    assert expiry == date(2026, 5, 1)


def test_calculate_expiry_takes_minimum(db, category, user):
    # Cert expires in 2 months, SOP says 6 → min is cert (Mar 1 2026)
    expiry = calculate_expiry_date(
        db, category.id, datetime(2026, 1, 1), None, date(2026, 3, 1)
    )
    assert expiry == date(2026, 3, 1)


def test_create_ledger_single(db, category, user):
    data = {
        "product_name": "乙醇",
        "batch_no": "ETH-2026-001",
        "cas_no": "64-17-5",
        "weight_capacity": "500mL",
        "supplier": "Sigma-Aldrich",
        "quantity": 1,
        "category_id": str(category.id),
        "cert_expiry_date": date(2028, 12, 31),
        "open_date": None,
    }
    ledgers = create_ledger(db, data, user.id)
    db.commit()

    assert len(ledgers) == 1
    ledger = ledgers[0]
    assert ledger.internal_batch_no.startswith(str(datetime.now().year))
    assert len(ledger.internal_batch_no) == 7
    assert ledger.status == "active"
    assert ledger.is_opened is False


def test_create_ledger_multiple_quantity(db, category, user):
    data = {
        "product_name": "丙酮",
        "batch_no": "ACE-2026-002",
        "cas_no": "67-64-1",
        "weight_capacity": "1L",
        "supplier": "国药集团",
        "quantity": 3,
        "category_id": str(category.id),
        "cert_expiry_date": date(2028, 12, 31),
    }
    ledgers = create_ledger(db, data, user.id)
    db.commit()

    assert len(ledgers) == 3
    assert all(len(l.internal_batch_no) == 9 for l in ledgers)  # bottle numbers
    assert ledgers[0].status == "active"


def test_update_open_date(db, category, user):
    data = {
        "product_name": "甲醇",
        "batch_no": "MET-2026-003",
        "cas_no": "67-56-1",
        "weight_capacity": "2.5L",
        "supplier": "Merck",
        "quantity": 1,
        "category_id": str(category.id),
        "cert_expiry_date": date(2028, 12, 31),
    }
    ledgers = create_ledger(db, data, user.id)
    db.commit()
    ledger = ledgers[0]
    assert ledger.is_opened is False

    updated = update_open_date(db, ledger, date(2026, 3, 1), user.id)
    db.commit()

    assert updated.is_opened is True
    assert updated.open_date == date(2026, 3, 1)
    assert updated.open_date_entered_by_id == user.id
    # category opened_shelf_months=3, so Mar 1 + 3mo = Jun 1 2026 (cert is 2028, so min=Jun1)
    assert updated.effective_expiry_date == date(2026, 6, 1)
