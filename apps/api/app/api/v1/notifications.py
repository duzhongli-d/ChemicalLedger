from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from app.db.models import Notification
from app.schemas.schemas import NotificationResponse
from app.api.deps import get_current_user_required

router = APIRouter()


@router.get("/", response_model=list[NotificationResponse])
def list_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_required),
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.sent_at.desc())
        .all()
    )


@router.patch("/{notification_id}/read")
def mark_as_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_required),
):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notification:
        from fastapi import HTTPException
        raise HTTPException(404, "Notification not found")
    notification.is_read = True
    db.flush()
    return {"ok": True}
