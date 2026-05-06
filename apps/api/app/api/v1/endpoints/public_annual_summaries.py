from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from app.db.session import get_db
from app.db.models import AnnualSummary
from app.api.v1.schemas.annual_summary import PublicAnnualSummaryResponse, PublicAnnualSummaryItem, PublicAnnualSummaryByCategoryResponse, PublicAnnualSummaryByCategoryItem

router = APIRouter()

SECTIONS = ["sample_testing", "method_dev", "stability_test"]
MAX_CATEGORIES = 50


@router.get("/annual-summaries/previous-year", response_model=PublicAnnualSummaryResponse)
def get_previous_year_annual_summaries(db: Session = Depends(get_db)):
    """
    Get annual summaries for the previous year.
    No authentication required.
    """
    current_year = datetime.now().year
    previous_year = current_year - 1

    summaries = (
        db.query(AnnualSummary)
        .filter(AnnualSummary.year == previous_year)
        .filter(AnnualSummary.section.in_(SECTIONS))
        .order_by(AnnualSummary.section)
        .all()
    )

    if not summaries:
        return PublicAnnualSummaryResponse(
            year=previous_year,
            data=[],
            message=f"{previous_year}年数据更新中",
        )

    data = [
        PublicAnnualSummaryItem(
            section=s.section,
            project_count=s.project_count,
            batch_count=s.batch_count if s.section == "sample_testing" else None,
        )
        for s in summaries
    ]

    return PublicAnnualSummaryResponse(year=previous_year, data=data)


@router.get("/annual-summaries/by-category", response_model=PublicAnnualSummaryByCategoryResponse)
def get_annual_summaries_by_category(
    categories: str = Query(..., min_length=1, description="comma-separated category names"),
    year: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """
    Get annual summaries by category for a specific year.
    No authentication required.
    Returns batch_count per category.
    """
    if year is None:
        year = datetime.now().year - 1

    current_year = datetime.now().year
    if year < 2000 or year > current_year + 1:
        year = current_year - 1

    category_list = [c.strip() for c in categories.split(",")][:MAX_CATEGORIES]

    summaries = (
        db.query(AnnualSummary)
        .filter(AnnualSummary.year == year)
        .filter(AnnualSummary.category.in_(category_list))
        .all()
    )

    if not summaries:
        return PublicAnnualSummaryByCategoryResponse(
            year=year,
            data=[],
            message=f"{year}年数据更新中",
        )

    data = [
        PublicAnnualSummaryByCategoryItem(
            category=s.category,
            batch_count=s.batch_count,
        )
        for s in summaries
    ]

    return PublicAnnualSummaryByCategoryResponse(year=year, data=data)
