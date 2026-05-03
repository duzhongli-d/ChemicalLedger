from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import ContactSubmission
from app.schemas.schemas import ContactSubmissionCreate
from app.api.deps import get_current_user
from app.db.models import User
from app.services.notification_service import send_contact_email

router = APIRouter()


@router.post("/", response_model=dict)
def submit_contact(
    data: ContactSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    """
    Submit a contact form. Auth is optional — user_id is captured if logged in.
    Saves to DB and sends email notification.
    """
    submission = ContactSubmission(
        user_id=current_user.id if current_user else None,
        name=data.name,
        email=data.email,
        subject=data.subject,
        category=data.category,
        message=data.message,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # Send email notification (async, non-blocking on response)
    send_contact_email(
        name=data.name,
        email=data.email,
        category=data.category,
        subject=data.subject,
        message=data.message,
    )

    return {"id": str(submission.id), "message": "Submission received"}
