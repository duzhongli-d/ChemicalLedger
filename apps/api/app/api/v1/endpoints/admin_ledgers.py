from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import Optional
import io, csv, openpyxl
from uuid import UUID
from datetime import datetime, date
from app.db.session import get_db
from app.api.deps import get_admin_user
from app.db.models import Ledger, Category, User, LedgerStatus
from app.schemas.schemas import BatchArchiveRequest, LedgerResponse, PaginatedLedgerResponse
from app.services.audit_service import AuditService
from app.services.ledger_service import import_ledger_batch

router = APIRouter()


@router.get("/", response_model=PaginatedLedgerResponse)
def list_ledgers(
    page: int = 1,
    page_size: int = 20,
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    query = db.query(Ledger).options(joinedload(Ledger.category))
    if search:
        query = query.filter(Ledger.product_name.contains(search) | Ledger.internal_batch_no.contains(search))
    if status:
        query = query.filter(Ledger.status == status)
    if category:
        from app.db.models import Category
        query = query.join(Ledger.category).filter(Category.level2 == category)

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedLedgerResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.patch("/{ledger_id}")
def update_ledger(
    ledger_id: UUID,
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    ledger = db.query(Ledger).filter(Ledger.id == ledger_id).first()
    if not ledger:
        raise HTTPException(status_code=404, detail="台账不存在")
    for field, value in data.items():
        if hasattr(ledger, field):
            setattr(ledger, field, value)
    db.commit()
    AuditService(db).log(current_user.id, "LEDGER_UPDATE", "ledger", ledger_id, {"fields": list(data.keys())})
    return {"message": "更新成功"}


@router.post("/batch-archive")
def batch_archive(
    req: BatchArchiveRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    archived_count = 0
    errors = []
    for ledger_id in req.ledger_ids:
        ledger = db.query(Ledger).filter(Ledger.id == ledger_id).first()
        if not ledger:
            errors.append(f"{ledger_id}: 不存在")
            continue
        if ledger.status == "archived":
            errors.append(f"{ledger_id}: 已归档")
            continue
        ledger.status = "archived"
        ledger.archived_at = datetime.utcnow()
        ledger.archived_by_id = current_user.id
        archived_count += 1
    db.commit()
    AuditService(db).log(
        current_user.id, "LEDGER_BATCH_ARCHIVE", "ledger", None,
        {"count": archived_count, "errors": errors},
    )
    return {"archived_count": archived_count, "errors": errors}


@router.post("/import")
def import_ledgers(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="未提供文件名")

    content = file.file.read()

    if file.filename.endswith((".xlsx", ".xls")):
        wb = openpyxl.load_workbook(io.BytesIO(content))
        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))
    elif file.filename.endswith(".csv"):
        decoded = content.decode("utf-8")
        reader = csv.reader(io.StringIO(decoded))
        rows = list(reader)
    else:
        raise HTTPException(status_code=400, detail="仅支持 .xlsx、.xls、.csv 文件")

    if len(rows) < 2:
        raise HTTPException(status_code=400, detail="文件为空或无数据行")

    result = import_ledger_batch(db, rows, current_user.id)
    AuditService(db).log(
        current_user.id, "LEDGER_IMPORT", "ledger", None,
        {"success": result["success_count"], "skipped": result["skip_count"]},
    )
    return result


@router.get("/import-template")
def download_import_template(
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    headers = ["product_name", "batch_no", "cas_no", "weight_capacity", "supplier", "category", "quantity", "cert_expiry_date", "open_date", "remarks"]
    sample = ["乙醇", "ETH-2026-001", "64-17-5", "500mL", "Sigma-Aldrich", "实验用溶液 / 一般限度试验用溶液", "1", "2028-12-31", "", ""]
    csv_content = ",".join(headers) + "\n" + ",".join(sample)
    buffer = io.BytesIO(("\ufeff" + csv_content).encode("utf-8"))
    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        buffer,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=台账导入模板.csv"},
    )