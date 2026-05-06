from pydantic import BaseModel
from typing import Optional, List


class PublicAnnualSummaryItem(BaseModel):
    section: str
    project_count: int
    batch_count: Optional[int] = None


class PublicAnnualSummaryResponse(BaseModel):
    year: int
    data: List[PublicAnnualSummaryItem]
    message: Optional[str] = None


class PublicAnnualSummaryByCategoryItem(BaseModel):
    category: str
    batch_count: Optional[int] = None


class PublicAnnualSummaryByCategoryResponse(BaseModel):
    year: int
    data: List[PublicAnnualSummaryByCategoryItem]
    message: Optional[str] = None
