from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import date
from uuid import UUID
from app.db.session import get_db
from app.db.models import User, ResearchNotebook, DailyUsage, UserRole
from app.schemas.schemas import QuotaResponse
from app.api.deps import get_current_user_required

router = APIRouter()

NOTEBOOKS_LIMIT = 3
DAILY_QUESTION_LIMIT = 10


@router.get("/quota", response_model=QuotaResponse)
def get_quota(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    today = date.today()
    usage = (
        db.query(DailyUsage)
        .filter(DailyUsage.user_id == current_user.id, DailyUsage.date == today)
        .first()
    )
    used_today = usage.question_count if usage else 0

    notebooks_count = db.query(ResearchNotebook).filter(ResearchNotebook.user_id == current_user.id).count()

    limit = 999999 if current_user.role == UserRole.admin else DAILY_QUESTION_LIMIT

    return QuotaResponse(
        used_today=used_today,
        limit=limit,
        notebooks_count=notebooks_count,
        notebooks_limit=999999 if current_user.role == UserRole.admin else NOTEBOOKS_LIMIT,
    )


@router.get("/notebooks")
def list_notebooks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    return (
        db.query(ResearchNotebook)
        .filter(ResearchNotebook.user_id == current_user.id)
        .order_by(ResearchNotebook.created_at.desc())
        .all()
    )


@router.post("/notebooks")
def create_notebook(
    notebook_id: str,
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    nb = ResearchNotebook(user_id=current_user.id, notebook_id=notebook_id, name=name)
    db.add(nb)
    db.commit()
    db.refresh(nb)
    return nb
