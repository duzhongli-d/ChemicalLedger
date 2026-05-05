from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.db.session import get_db
from app.api.deps import get_admin_user
from app.db.models import AnnualSummary
from pydantic import BaseModel

router = APIRouter()


class AnnualSummaryBase(BaseModel):
    year: int
    section: str
    category: Optional[str] = None
    project_count: int = 0
    project_names: Optional[str] = None
    batch_count: int = 0
    yoy_growth: Optional[str] = None


class AnnualSummaryCreate(AnnualSummaryBase):
    pass


class AnnualSummaryUpdate(BaseModel):
    section: Optional[str] = None
    category: Optional[str] = None
    project_count: Optional[int] = None
    project_names: Optional[str] = None
    batch_count: Optional[int] = None
    yoy_growth: Optional[str] = None


class AnnualSummaryResponse(AnnualSummaryBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


@router.get("/", response_model=List[AnnualSummaryResponse])
def list_annual_summaries(
    year: Optional[int] = None,
    section: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    query = db.query(AnnualSummary)
    if year is not None:
        query = query.filter(AnnualSummary.year == year)
    if section is not None:
        query = query.filter(AnnualSummary.section == section)
    return query.order_by(AnnualSummary.year.desc(), AnnualSummary.section).all()


@router.get("/{year}", response_model=List[AnnualSummaryResponse])
def get_annual_summary_by_year(
    year: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    return db.query(AnnualSummary).filter(AnnualSummary.year == year).order_by(AnnualSummary.section).all()


@router.post("/", response_model=AnnualSummaryResponse)
def create_annual_summary(
    data: AnnualSummaryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    # Check for duplicate
    existing = db.query(AnnualSummary).filter(
        AnnualSummary.year == data.year,
        AnnualSummary.section == data.section,
        AnnualSummary.category == data.category,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="该记录已存在")

    summary = AnnualSummary(**data.model_dump())
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return summary


@router.put("/{summary_id}", response_model=AnnualSummaryResponse)
def update_annual_summary(
    summary_id: UUID,
    data: AnnualSummaryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    summary = db.query(AnnualSummary).filter(AnnualSummary.id == summary_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="记录不存在")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(summary, key, value)

    db.commit()
    db.refresh(summary)
    return summary


@router.delete("/{summary_id}")
def delete_annual_summary(
    summary_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    summary = db.query(AnnualSummary).filter(AnnualSummary.id == summary_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="记录不存在")

    db.delete(summary)
    db.commit()
    return {"message": "删除成功"}