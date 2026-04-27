from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from uuid import UUID
from typing import Optional


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    phone: Optional[str] = None
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: UUID
    username: str
    email: str
    phone: Optional[str]
    role: str
    department: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    level1: str
    level2: str
    warning_threshold_days: int = 30
    unopened_shelf_months: int
    opened_shelf_months: int
    remarks: Optional[str] = None


class CategoryResponse(BaseModel):
    id: UUID
    level1: str
    level2: str
    warning_threshold_days: int
    unopened_shelf_months: int
    opened_shelf_months: int

    class Config:
        from_attributes = True


class LedgerCreate(BaseModel):
    product_name: str
    batch_no: str
    cas_no: str
    weight_capacity: str
    supplier: str
    quantity: int = 1
    category_id: UUID
    cert_expiry_date: date
    open_date: Optional[date] = None


class LedgerUpdate(BaseModel):
    product_name: Optional[str] = None
    batch_no: Optional[str] = None
    cas_no: Optional[str] = None
    weight_capacity: Optional[str] = None
    supplier: Optional[str] = None
    quantity: Optional[int] = None
    category_id: Optional[UUID] = None
    cert_expiry_date: Optional[date] = None
    remarks: Optional[str] = None


class LedgerResponse(BaseModel):
    id: UUID
    internal_batch_no: str
    product_name: str
    batch_no: str
    cas_no: str
    weight_capacity: str
    supplier: str
    quantity: int
    category: CategoryResponse
    cert_expiry_date: date
    open_date: Optional[date]
    effective_expiry_date: date
    is_opened: bool
    status: str
    created_at: datetime
    created_by_id: UUID
    remarks: Optional[str]

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class NotificationResponse(BaseModel):
    id: UUID
    type: str
    title: str
    content: str
    ledger_id: Optional[UUID]
    is_read: bool
    sent_at: datetime

    class Config:
        from_attributes = True


class QuotaResponse(BaseModel):
    used_today: int
    limit: int
    notebooks_count: int
    notebooks_limit: int
