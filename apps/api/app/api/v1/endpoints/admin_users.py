from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import openpyxl
import csv
import io
from uuid import uuid4
from app.db.session import get_db
from app.api.deps import get_admin_user
from app.db.models import User
from app.schemas.schemas import AdminUserCreate, UserUpdate, UserResponse, ResetPasswordRequest
from app.core.security import hash_password
from app.services.audit_service import AuditService

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def list_users(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user),
):
    query = db.query(User)
    if search:
        query = query.filter(User.username.contains(search) | User.email.contains(search))
    if role:
        query = query.filter(User.role == role)
    return query.offset((page-1)*page_size).limit(page_size).all()

@router.post("/", response_model=UserResponse)
def create_user(
    user_data: AdminUserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user),
):
    existing = db.query(User).filter(User.username == user_data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="用户名已存在")
    user = User(
        id=uuid4(),
        username=user_data.username,
        email=user_data.email,
        phone=user_data.phone,
        department=user_data.department,
        role=user_data.role,
        password_hash=hash_password(str(uuid4())[:8]),  # 临时密码
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    AuditService(db).log(current_user.id, "USER_CREATE", "user", user.id, {"username": user.username})
    return user

@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    for field, value in user_data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    AuditService(db).log(current_user.id, "USER_UPDATE", "user", user.id)
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id,
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="不能删除自己")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    db.delete(user)
    db.commit()
    AuditService(db).log(current_user.id, "USER_DELETE", "user", user_id)
    return {"message": "删除成功"}

@router.post("/import")
async def import_users(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user),
):
    content = await file.read()
    filename = file.filename or ""

    success_count = 0
    skip_count = 0
    errors = []

    if filename.endswith(('.xlsx', '.xls')):
        wb = openpyxl.load_workbook(io.BytesIO(content))
        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))
    elif filename.endswith('.csv'):
        decoded = content.decode('utf-8')
        reader = csv.reader(io.StringIO(decoded))
        rows = list(reader)
    else:
        raise HTTPException(status_code=400, detail="仅支持 .xlsx/.csv 文件")

    for i, row in enumerate(rows[1:], start=2):  # 跳过表头
        try:
            username, email, phone, department, role = row[0], row[1], row[2] if len(row) > 2 else None, row[3] if len(row) > 3 else None, row[4] if len(row) > 4 else "user"
            existing = db.query(User).filter(
                (User.username == username) | (User.email == email)
            ).first()
            if existing:
                skip_count += 1
                continue
            user = User(
                id=uuid4(),
                username=username,
                email=email,
                phone=phone,
                department=department,
                role=role,
                password_hash=hash_password(str(uuid4())[:8]),
            )
            db.add(user)
            success_count += 1
        except Exception as e:
            errors.append(f"第{i}行错误: {str(e)}")

    db.commit()
    AuditService(db).log(
        current_user.id, "USER_IMPORT", "user", None,
        {"success": success_count, "skipped": skip_count, "errors": errors}
    )
    return {"success_count": success_count, "skip_count": skip_count, "errors": errors}

@router.post("/{user_id}/reset-password")
def reset_user_password(
    user_id,
    password_data: ResetPasswordRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    user.password_hash = hash_password(password_data.new_password)
    db.commit()
    AuditService(db).log(
        current_user.id, "admin_reset_password", "user", user_id,
        {"username": user.username}
    )
    return {"message": "密码重置成功"}