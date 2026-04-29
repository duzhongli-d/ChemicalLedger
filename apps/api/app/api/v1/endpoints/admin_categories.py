from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_admin_user
from app.db.models import Category, Ledger
from app.schemas.schemas import CategoryUpdate
from app.services.audit_service import AuditService

router = APIRouter()


@router.patch("/{category_id}")
def update_category(
    category_id,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="品类不存在")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    db.commit()
    AuditService(db).log(current_user.id, "CATEGORY_UPDATE", "category", category_id, data.model_dump())
    return {"message": "更新成功"}


@router.delete("/{category_id}")
def delete_category(
    category_id,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    has_ledgers = db.query(Ledger).filter(Ledger.category_id == category_id).count()
    if has_ledgers > 0:
        raise HTTPException(status_code=400, detail=f"该品类下有 {has_ledgers} 条台账记录，无法删除")
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="品类不存在")
    db.delete(category)
    db.commit()
    return {"message": "删除成功"}