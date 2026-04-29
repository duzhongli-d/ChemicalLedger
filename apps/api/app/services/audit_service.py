from datetime import datetime
from uuid import UUID
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.db.models import AuditLog


class AuditService:
    def __init__(self, db: Session):
        self.db = db

    def log(
        self,
        user_id: Optional[UUID],
        action: str,
        target_type: Optional[str] = None,
        target_id: Optional[UUID] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
    ):
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details,
            ip_address=ip_address,
        )
        self.db.add(audit_log)
        self.db.commit()
