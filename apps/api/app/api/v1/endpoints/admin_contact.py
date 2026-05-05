from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.db.session import get_db
from app.api.deps import get_admin_user
from app.db.models import ContactSubmission, ContactReply
from app.schemas.schemas import PaginatedContactResponse, ContactSubmissionDetailResponse, ContactReplyResponse
from app.services.notification_service import send_contact_reply_email

router = APIRouter()


@router.get("/", response_model=PaginatedContactResponse)
def list_contact_submissions(
    page: int = 1,
    page_size: int = 20,
    is_read: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    query = db.query(ContactSubmission).order_by(ContactSubmission.created_at.desc())
    if is_read == "true":
        query = query.filter(ContactSubmission.is_read == True)
    elif is_read == "false":
        query = query.filter(ContactSubmission.is_read == False)
    if category:
        query = query.filter(ContactSubmission.category == category)
    if search:
        query = query.filter(
            ContactSubmission.name.contains(search) |
            ContactSubmission.email.contains(search) |
            ContactSubmission.subject.contains(search) |
            ContactSubmission.message.contains(search)
        )
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedContactResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{submission_id}", response_model=ContactSubmissionDetailResponse)
def get_contact_submission(
    submission_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    submission = db.query(ContactSubmission).options(
        joinedload(ContactSubmission.replies).joinedload(ContactReply.admin)
    ).filter(ContactSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="联系记录不存在")
    return submission


@router.patch("/{submission_id}/read")
def mark_contact_read(
    submission_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    submission = db.query(ContactSubmission).filter(ContactSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="联系记录不存在")
    submission.is_read = True
    db.commit()
    return {"message": "标记已读"}


@router.post("/{submission_id}/reply")
def reply_contact_submission(
    submission_id: UUID,
    content: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    submission = db.query(ContactSubmission).filter(ContactSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="联系记录不存在")
    reply = ContactReply(
        submission_id=submission_id,
        admin_id=current_user.id,
        content=content,
    )
    db.add(reply)
    if not submission.is_read:
        submission.is_read = True
    db.commit()
    send_contact_reply_email(
        user_email=submission.email,
        user_name=submission.name,
        subject=submission.subject,
        reply_content=content,
    )
    return {"message": "回复已发送"}