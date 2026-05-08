from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_admin_user
from app.schemas.schemas import (
    SystemSettingsResponse,
    SMTPConfigBase,
    ContactConfigBase,
)
from app.db.models import SystemSetting, User
from app.services.audit_service import AuditService

router = APIRouter()


def get_settings_by_category(db: Session, category: str) -> dict:
    settings = db.query(SystemSetting).filter(
        SystemSetting.category == category
    ).all()
    result = {}
    for s in settings:
        if s.value_type == "bool":
            result[s.key] = s.value.lower() == "true" if s.value else False
        elif s.value_type == "int":
            result[s.key] = int(s.value) if s.value else 0
        else:
            result[s.key] = s.value
    return result


def update_settings(db: Session, category: str, data: dict, user_id):
    for key, value in data.items():
        if value is None:
            continue
        setting = db.query(SystemSetting).filter(
            SystemSetting.category == category,
            SystemSetting.key == key
        ).first()
        if setting:
            str_value = str(value).lower() if isinstance(value, bool) else str(value)
            setting.value = str_value
            setting.updated_by_id = user_id
    db.commit()


@router.get("/", response_model=SystemSettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    smtp = get_settings_by_category(db, "smtp")
    contact = get_settings_by_category(db, "contact")
    # 不返回 password
    smtp.pop("password", None)
    return {"smtp": smtp, "contact": contact}


@router.patch("/smtp", response_model=SMTPConfigBase)
def update_smtp_settings(
    data: SMTPConfigBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    update_settings(db, "smtp", data.model_dump(exclude_none=True), current_user.id)
    AuditService(db).log(current_user.id, "SETTINGS_UPDATE", "system_setting", details={"category": "smtp", "fields": list(data.model_dump(exclude_none=True).keys())})
    result = get_settings_by_category(db, "smtp")
    result.pop("password", None)
    return result


@router.patch("/contact", response_model=ContactConfigBase)
def update_contact_settings(
    data: ContactConfigBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    update_settings(db, "contact", data.model_dump(exclude_none=True), current_user.id)
    AuditService(db).log(current_user.id, "SETTINGS_UPDATE", "system_setting", details={"category": "contact", "fields": list(data.model_dump(exclude_none=True).keys())})
    return get_settings_by_category(db, "contact")
