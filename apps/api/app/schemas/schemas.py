from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator
from datetime import date, datetime
from uuid import UUID
from typing import Optional, List, Literal


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    phone: Optional[str] = None
    password: str


class AdminUserCreate(BaseModel):
    username: str
    email: EmailStr
    phone: Optional[str] = None
    department: Optional[str] = None
    role: str = "user"


class UserLogin(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str

    @model_validator(mode="after")
    def check_identity(self):
        if not self.username and not self.email:
            raise ValueError("Either username or email must be provided")
        return self


class UserResponse(BaseModel):
    id: UUID
    username: str
    email: str
    phone: Optional[str]
    role: str
    department: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)


class QuotaResponse(BaseModel):
    used_today: int
    limit: int
    notebooks_count: int
    notebooks_limit: int


class AuditLogBase(BaseModel):
    action: str
    target_type: Optional[str] = None
    target_id: Optional[UUID] = None
    details: Optional[dict] = None
    ip_address: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    user_id: UUID


class AuditLogResponse(AuditLogBase):
    id: UUID
    user_id: Optional[UUID]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLogResponseWithUser(AuditLogBase):
    id: UUID
    user_id: Optional[UUID]
    created_at: datetime
    user: Optional["UserResponse"] = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None


class CategoryUpdate(BaseModel):
    warning_threshold_days: Optional[int] = None
    unopened_shelf_months: Optional[int] = None
    opened_shelf_months: Optional[int] = None
    remarks: Optional[str] = None


class BatchArchiveRequest(BaseModel):
    ledger_ids: List[UUID]


class ResetPasswordRequest(BaseModel):
    new_password: str


class ContactSubmissionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    subject: str = Field(..., min_length=1, max_length=255)
    category: Literal["support", "technical", "feature", "business", "other"]
    message: str = Field(..., min_length=10, max_length=2000)


class ContactSubmissionResponse(BaseModel):
    id: UUID
    name: str
    email: str
    subject: str
    category: str
    message: str
    is_read: bool
    created_at: datetime
    user_id: Optional[UUID]

    model_config = ConfigDict(from_attributes=True)


class ContactReplyResponse(BaseModel):
    id: UUID
    admin_id: UUID
    content: str
    created_at: datetime
    admin: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)


class ContactSubmissionDetailResponse(BaseModel):
    id: UUID
    name: str
    email: str
    subject: str
    category: str
    message: str
    is_read: bool
    created_at: datetime
    user_id: Optional[UUID]
    replies: List[ContactReplyResponse] = []

    model_config = ConfigDict(from_attributes=True)


class PaginatedContactResponse(BaseModel):
    items: List[ContactSubmissionDetailResponse]
    total: int
    page: int
    page_size: int


class PaginatedLedgerResponse(BaseModel):
    items: list[LedgerResponse]
    total: int
    page: int
    page_size: int


# System Settings Schemas

class SMTPConfigBase(BaseModel):
    enabled: Optional[bool] = None
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    sender_email: Optional[str] = None
    sender_name: Optional[str] = None
    use_tls: Optional[bool] = None


class SMTPConfigResponse(SMTPConfigBase):
    model_config = ConfigDict(from_attributes=True)


class ContactConfigBase(BaseModel):
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    wechat: Optional[str] = None
    business_hours: Optional[str] = None


class ContactConfigResponse(ContactConfigBase):
    model_config = ConfigDict(from_attributes=True)


class SystemSettingsResponse(BaseModel):
    smtp: SMTPConfigResponse
    contact: ContactConfigResponse
