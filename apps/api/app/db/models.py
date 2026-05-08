import uuid as uuid_lib
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, Date, DateTime, ForeignKey, Text, JSON, UniqueConstraint
from sqlalchemy import func
from sqlalchemy import Uuid
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class UserRole(str):
    user = "user"
    admin = "admin"


class LedgerStatus(str):
    active = "active"
    archived = "archived"


class NotificationType(str):
    expiry_warning = "expiry_warning"
    expiry_alert = "expiry_alert"
    system = "system"


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid_lib.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user")
    department = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    ledgers = relationship("Ledger", back_populates="creator", foreign_keys="Ledger.created_by_id")
    notifications = relationship("Notification", back_populates="user")
    notebooks = relationship("ResearchNotebook", back_populates="user")
    daily_usages = relationship("DailyUsage", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user", order_by="desc(AuditLog.created_at)")
    contact_submissions = relationship("ContactSubmission", back_populates="user")
    contact_replies = relationship("ContactReply", back_populates="admin")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Uuid, primary_key=True, default=uuid_lib.uuid4)
    level1 = Column(String(100), nullable=False)
    level2 = Column(String(100), nullable=False)
    warning_threshold_days = Column(Integer, default=30)
    unopened_shelf_months = Column(Integer, nullable=False)
    opened_shelf_months = Column(Integer, nullable=False)
    remarks = Column(Text, nullable=True)

    ledgers = relationship("Ledger", back_populates="category")


class Ledger(Base):
    __tablename__ = "ledgers"

    id = Column(Uuid, primary_key=True, default=uuid_lib.uuid4)
    internal_batch_no = Column(String(20), unique=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    batch_no = Column(String(100), nullable=False)
    cas_no = Column(String(50), nullable=False)
    weight_capacity = Column(String(50), nullable=False)
    supplier = Column(String(255), nullable=False)
    quantity = Column(Integer, default=1)
    category_id = Column(Uuid, ForeignKey("categories.id"), nullable=False)
    cert_expiry_date = Column(Date, nullable=False)
    open_date = Column(Date, nullable=True)
    effective_expiry_date = Column(Date, nullable=False)
    is_opened = Column(Boolean, default=False)
    status = Column(String(20), default=LedgerStatus.active)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_by_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    open_date_entered_by_id = Column(Uuid, ForeignKey("users.id"), nullable=True)
    open_date_entered_at = Column(DateTime, nullable=True)
    archived_at = Column(DateTime, nullable=True)
    archived_by_id = Column(Uuid, ForeignKey("users.id"), nullable=True)
    remarks = Column(Text, nullable=True)

    category = relationship("Category", back_populates="ledgers")
    creator = relationship("User", foreign_keys=[created_by_id], back_populates="ledgers")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Uuid, primary_key=True, default=uuid_lib.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    ledger_id = Column(Uuid, ForeignKey("ledgers.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")
    ledger = relationship("Ledger")


class ResearchNotebook(Base):
    __tablename__ = "research_notebooks"

    id = Column(Uuid, primary_key=True, default=uuid_lib.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    notebook_id = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notebooks")


class DailyUsage(Base):
    __tablename__ = "daily_usages"

    id = Column(Uuid, primary_key=True, default=uuid_lib.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    question_count = Column(Integer, default=0)

    user = relationship("User", back_populates="daily_usages")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Uuid, primary_key=True, default=uuid_lib.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=True)
    action = Column(String(50), nullable=False)
    target_type = Column(String(50), nullable=True)
    target_id = Column(Uuid, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="audit_logs")


class ContactSubmission(Base):
    __tablename__ = "contact_submissions"

    id = Column(Uuid, primary_key=True, default=uuid_lib.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=True)  # null if anonymous
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)  # support/technical/feature/business/other
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="contact_submissions")
    replies = relationship("ContactReply", back_populates="submission", order_by="desc(ContactReply.created_at)")


class ContactReply(Base):
    __tablename__ = "contact_replies"

    id = Column(Uuid, primary_key=True, default=uuid_lib.uuid4)
    submission_id = Column(Uuid, ForeignKey("contact_submissions.id"), nullable=False)
    admin_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    submission = relationship("ContactSubmission", back_populates="replies")
    admin = relationship("User")


class DailyStats(Base):
    __tablename__ = "daily_stats"

    id = Column(Uuid, primary_key=True, default=uuid_lib.uuid4)
    date = Column(Date, nullable=False, unique=True)
    total_ledgers = Column(Integer, nullable=False, default=0)
    active_ledgers = Column(Integer, nullable=False, default=0)
    expiring_ledgers = Column(Integer, nullable=False, default=0)
    archived_ledgers = Column(Integer, nullable=False, default=0)
    created_count = Column(Integer, nullable=False, default=0)
    archived_count = Column(Integer, nullable=False, default=0)


class AnnualSummary(Base):
    __tablename__ = "annual_summaries"

    id = Column(Uuid, primary_key=True, default=uuid_lib.uuid4)
    year = Column(Integer, nullable=False)
    section = Column(String(50), nullable=False)  # "sample_testing", "method_dev", "stability_test"
    category = Column(String(100), nullable=True)  # 检测类型/类别
    project_count = Column(Integer, default=0)
    project_names = Column(Text, nullable=True)  # 项目名称，逗号分隔
    batch_count = Column(Integer, default=0)  # 检测批次数
    yoy_growth = Column(String(20), nullable=True)  # 同比增长率，如 "22%"
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint('year', 'section', 'category', name='uq_annual_summary_year_section_category'),
    )


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Uuid, primary_key=True, default=uuid_lib.uuid4)
    category = Column(String(50), nullable=False, index=True)
    key = Column(String(100), nullable=False)
    value = Column(Text, nullable=True)
    value_type = Column(String(20), server_default="string")
    is_secret = Column(Boolean, default=False)
    description = Column(String(255), nullable=True)
    updated_by_id = Column(Uuid, ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    updated_by = relationship("User", foreign_keys=[updated_by_id])

    __table_args__ = (
        UniqueConstraint("category", "key", name="uq_category_key"),
    )
