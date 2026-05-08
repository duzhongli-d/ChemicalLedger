from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.schemas import ContactConfigResponse
from app.api.v1.endpoints.admin_settings import get_settings_by_category

router = APIRouter()


@router.get("/contact", response_model=ContactConfigResponse)
def get_public_contact_settings(db: Session = Depends(get_db)):
    """
    Public endpoint - no authentication required.
    Returns contact settings configured in admin panel.
    """
    return get_settings_by_category(db, "contact")