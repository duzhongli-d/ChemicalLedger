from sqlalchemy.orm import Session
from datetime import datetime, date, timezone
from dateutil.relativedelta import relativedelta
from uuid import UUID
from app.db.models import Ledger, Category, User, LedgerStatus


def parse_date(value) -> date | None:
    """Parse Excel datetime objects or string dates in multiple formats."""
    if value is None or (isinstance(value, str) and not value.strip()):
        return None
    if isinstance(value, datetime):
        return value.date()
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d"):
        try:
            return datetime.strptime(str(value).strip(), fmt).date()
        except ValueError:
            pass
    return None


def import_ledger_batch(db: Session, rows: list, user_id: UUID) -> dict:
    """
    Batch import ledgers from CSV/Excel rows.

    Args:
        db: Database session
        rows: CSV/Excel row list, first row is header
        user_id: Current admin user ID

    Returns:
        {"success_count": int, "skip_count": int, "errors": list[str]}
    """
    # Build category lookup: "level1 / level2" -> UUID
    category_map: dict[str, UUID] = {}
    for cat in db.query(Category).all():
        key = f"{cat.level1} / {cat.level2}"
        category_map[key] = cat.id

    headers = [h.lower().strip() if isinstance(h, str) else "" for h in rows[0]]
    col = {h: i for i, h in enumerate(headers)}

    required = ["product_name", "batch_no", "cas_no", "weight_capacity", "supplier", "category"]
    success_count = 0
    skip_count = 0
    errors = []

    for row_idx, row in enumerate(rows[1:], start=2):
        try:
            # Field existence check
            for field in required:
                if field not in col:
                    errors.append(f"第{row_idx}行: 缺少必填字段 '{field}'")
                    skip_count += 1
                    break
                val = row[col[field]] if col[field] < len(row) else None
                if not val or (isinstance(val, str) and not val.strip()):
                    errors.append(f"第{row_idx}行: 字段 '{field}' 不能为空")
                    skip_count += 1
                    break
            else:
                # Category lookup
                cat_name = str(row[col["category"]]).strip()
                category_id = category_map.get(cat_name)
                if not category_id:
                    errors.append(f"第{row_idx}行: 品类 '{cat_name}' 不存在")
                    skip_count += 1
                    continue

                data = {
                    "product_name": str(row[col["product_name"]]).strip(),
                    "batch_no": str(row[col["batch_no"]]).strip(),
                    "cas_no": str(row[col["cas_no"]]).strip(),
                    "weight_capacity": str(row[col["weight_capacity"]]).strip(),
                    "supplier": str(row[col["supplier"]]).strip(),
                    "quantity": int(row[col["quantity"]]) if "quantity" in col and col["quantity"] < len(row) and str(row[col["quantity"]]).strip() else 1,
                    "category_id": category_id,
                    "cert_expiry_date": parse_date(row[col["cert_expiry_date"]]) if "cert_expiry_date" in col and col["cert_expiry_date"] < len(row) else None,
                    "open_date": parse_date(row[col["open_date"]]) if "open_date" in col and col["open_date"] < len(row) else None,
                    "remarks": str(row[col["remarks"]]).strip() if "remarks" in col and col["remarks"] < len(row) and row[col["remarks"]] else None,
                }
                create_ledger(db, data, user_id)
                success_count += 1
        except Exception as e:
            errors.append(f"第{row_idx}行: {str(e)}")
            skip_count += 1

    db.commit()
    return {"success_count": success_count, "skip_count": skip_count, "errors": errors}


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
    cert_expiry = data.get("cert_expiry_date")
    open_date = data.get("open_date")

    ledgers = []
    for i, batch_no in enumerate(batch_nos):
        # Use far-future sentinel so MIN(sop_expiry, date.max) = sop_expiry when cert_expiry is None
        _sentinel = date.max if cert_expiry is None else cert_expiry
        expiry = calculate_expiry_date(db, category_id, created_at, open_date, _sentinel)
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
