from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from uuid import UUID
from datetime import datetime, date
from app.db.session import get_db
from app.db.models import User, Ledger, LedgerStatus
from app.schemas.schemas import LedgerCreate, LedgerUpdate, LedgerResponse
from app.api.deps import get_current_user, get_current_user_required, get_admin_user
from app.services.ledger_service import create_ledger, update_open_date

router = APIRouter()


@router.get("/", response_model=list[LedgerResponse])
def list_ledgers(
    status: str | None = None,
    category_id: UUID | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(Ledger)
    if status:
        q = q.filter(Ledger.status == status)
    if category_id:
        q = q.filter(Ledger.category_id == category_id)
    if search:
        q = q.filter(or_(
            Ledger.product_name.ilike(f"%{search}%"),
            Ledger.batch_no.ilike(f"%{search}%"),
            Ledger.cas_no.ilike(f"%{search}%"),
            Ledger.internal_batch_no.ilike(f"%{search}%"),
        ))
    return q.order_by(Ledger.created_at.desc()).all()


@router.get("/{ledger_id}", response_model=LedgerResponse)
def get_ledger(ledger_id: UUID, db: Session = Depends(get_db)):
    ledger = db.query(Ledger).filter(Ledger.id == ledger_id).first()
    if not ledger:
        raise HTTPException(404, "Ledger not found")
    return ledger


@router.post("/", response_model=list[LedgerResponse])
def create_ledger_endpoint(
    data: LedgerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    ledgers = create_ledger(db, data.model_dump(), current_user.id)
    db.commit()
    return [LedgerResponse.model_validate(l) for l in ledgers]


@router.patch("/{ledger_id}", response_model=LedgerResponse)
def update_ledger(
    ledger_id: UUID,
    data: LedgerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    ledger = db.query(Ledger).filter(Ledger.id == ledger_id).first()
    if not ledger:
        raise HTTPException(404, "Ledger not found")
    if ledger.created_by_id != current_user.id and current_user.role != "admin":
        raise HTTPException(403, "Not authorized")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(ledger, key, value)
    db.flush()
    return ledger


@router.patch("/{ledger_id}/open", response_model=LedgerResponse)
def enter_open_date(
    ledger_id: UUID,
    open_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    ledger = db.query(Ledger).filter(Ledger.id == ledger_id).first()
    if not ledger:
        raise HTTPException(404, "Ledger not found")
    if ledger.created_by_id != current_user.id and current_user.role != "admin":
        raise HTTPException(403, "Not authorized")
    ledger = update_open_date(db, ledger, open_date, current_user.id)
    db.commit()
    return ledger


@router.post("/{ledger_id}/archive", response_model=LedgerResponse)
def archive_ledger(
    ledger_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    ledger = db.query(Ledger).filter(Ledger.id == ledger_id).first()
    if not ledger:
        raise HTTPException(404, "Ledger not found")
    if ledger.created_by_id != current_user.id and current_user.role != "admin":
        raise HTTPException(403, "Not authorized")
    ledger.status = LedgerStatus.archived
    ledger.archived_at = datetime.utcnow()
    ledger.archived_by_id = current_user.id
    db.flush()
    return ledger
