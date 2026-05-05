from datetime import date
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app.db.session import get_db
from app.api.deps import get_admin_user
from app.db.models import AuditLog
from app.schemas.schemas import AuditLogResponse, AuditLogResponseWithUser

router = APIRouter()


@router.get("/", response_model=List[AuditLogResponseWithUser])
def list_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    action: Optional[str] = None,
    user_id: Optional[UUID] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    target_type: Optional[str] = None,
    target_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    query = db.query(AuditLog).options(joinedload(AuditLog.user))
    if action:
        query = query.filter(AuditLog.action == action)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if start_date:
        query = query.filter(AuditLog.created_at >= start_date)
    if end_date:
        query = query.filter(AuditLog.created_at <= end_date)
    if target_type:
        query = query.filter(AuditLog.target_type == target_type)
    if target_id:
        query = query.filter(AuditLog.target_id == target_id)
    return query.order_by(AuditLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
