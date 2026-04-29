from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.db.session import get_db
from app.api.deps import get_admin_user
from app.db.models import Ledger
from app.schemas.schemas import BatchArchiveRequest
from app.services.audit_service import AuditService

router = APIRouter()


@router.get("/")
def list_ledgers(
    page: int = 1,
    page_size: int = 20,
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    query = db.query(Ledger)
    if search:
        query = query.filter(Ledger.product_name.contains(search) | Ledger.internal_batch_no.contains(search))
    if status:
        query = query.filter(Ledger.status == status)
    return query.offset((page - 1) * page_size).limit(page_size).all()


@router.patch("/{ledger_id}")
def update_ledger(
    ledger_id: UUID,
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    ledger = db.query(Ledger).filter(Ledger.id == ledger_id).first()
    if not ledger:
        raise HTTPException(status_code=404, detail="台账不存在")
    for field, value in data.items():
        if hasattr(ledger, field):
            setattr(ledger, field, value)
    db.commit()
    AuditService(db).log(current_user.id, "LEDGER_UPDATE", "ledger", ledger_id, {"fields": list(data.keys())})
    return {"message": "更新成功"}


@router.post("/batch-archive")
def batch_archive(
    req: BatchArchiveRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    archived_count = 0
    errors = []
    for ledger_id in req.ledger_ids:
        ledger = db.query(Ledger).filter(Ledger.id == ledger_id).first()
        if not ledger:
            errors.append(f"{ledger_id}: 不存在")
            continue
        if ledger.status == "archived":
            errors.append(f"{ledger_id}: 已归档")
            continue
        ledger.status = "archived"
        ledger.archived_at = datetime.utcnow()
        ledger.archived_by_id = current_user.id
        archived_count += 1
    db.commit()
    AuditService(db).log(
        current_user.id, "LEDGER_BATCH_ARCHIVE", "ledger", None,
        {"count": archived_count, "errors": errors},
    )
    return {"archived_count": archived_count, "errors": errors}