from sqlalchemy.orm import Session
from datetime import datetime, date, timezone
from dateutil.relativedelta import relativedelta
from uuid import UUID
from app.db.models import Ledger, Category, User, LedgerStatus


def generate_internal_batch_no(db: Session, quantity: int) -> list[str]:
    """Generate YYYYMMMNNN format. If quantity>1, returns multiple with bottle numbers."""
    year = datetime.now().year
    last_ledger = (
        db.query(Ledger)
        .filter(Ledger.internal_batch_no.like(f"{year}%"))
        .order_by(Ledger.created_at.desc())
        .first()
    )

    if last_ledger:
        seq_str = last_ledger.internal_batch_no[4:7]
        seq = int(seq_str)
    else:
        seq = 0

    seq += 1
    seq_str = f"{seq:03d}"

    if quantity == 1:
        return [f"{year}{seq_str}"]
    else:
        return [f"{year}{seq_str}{i+1:02d}" for i in range(quantity)]


def calculate_expiry_date(
    db: Session,
    category_id: UUID,
    created_at: datetime,
    open_date: date | None,
    cert_expiry_date: date,
) -> date:
    """MIN(SOP_expiry, cert_expiry). SOP depends on open_date and category shelf months."""
    category = db.query(Category).filter(Category.id == category_id).first()
    base_date = open_date if open_date else created_at.date()
    shelf_months = category.opened_shelf_months if open_date else category.unopened_shelf_months
    sop_expiry = base_date + relativedelta(months=shelf_months)
    return min(sop_expiry, cert_expiry_date)


def create_ledger(db: Session, data: dict, created_by_id: UUID) -> list[Ledger]:
    """Creates quantity ledger entries with sequential batch numbers."""
    quantity = data.get("quantity", 1)
    batch_nos = generate_internal_batch_no(db, quantity)
    category_id = data["category_id"]
    if isinstance(category_id, str):
        category_id = UUID(category_id)
    created_at = datetime.now(timezone.utc)
    cert_expiry = data["cert_expiry_date"]
    open_date = data.get("open_date")

    ledgers = []
    for i, batch_no in enumerate(batch_nos):
        expiry = calculate_expiry_date(db, category_id, created_at, open_date, cert_expiry)
        ledger = Ledger(
            internal_batch_no=batch_no,
            product_name=data["product_name"],
            batch_no=data["batch_no"],
            cas_no=data["cas_no"],
            weight_capacity=data["weight_capacity"],
            supplier=data["supplier"],
            quantity=1,
            category_id=category_id,
            cert_expiry_date=cert_expiry,
            open_date=open_date,
            effective_expiry_date=expiry,
            is_opened=open_date is not None,
            status=LedgerStatus.active,
            created_by_id=created_by_id,
        )
        db.add(ledger)
        ledgers.append(ledger)
    db.flush()
    return ledgers


def update_open_date(db: Session, ledger: Ledger, open_date: date, user_id: UUID) -> Ledger:
    """Updates open_date, recalculates expiry, sets is_opened=True."""
    ledger.open_date = open_date
    ledger.is_opened = True
    ledger.open_date_entered_by_id = user_id
    ledger.open_date_entered_at = datetime.now(timezone.utc)
    ledger.effective_expiry_date = calculate_expiry_date(
        db, ledger.category_id, ledger.created_at, open_date, ledger.cert_expiry_date,
    )
    db.flush()
    return ledger
