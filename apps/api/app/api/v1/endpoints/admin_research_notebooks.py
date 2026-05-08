from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.db.session import get_db
from app.api.deps import get_admin_user
from app.db.models import ResearchNotebook
from pydantic import BaseModel

router = APIRouter()


class NotebookResponse(BaseModel):
    id: UUID
    notebook_id: str
    name: str
    user_id: UUID
    username: str
    created_at: str

    model_config = {"from_attributes": True}


class PaginatedNotebooks(BaseModel):
    items: List[NotebookResponse]
    total: int
    page: int
    page_size: int


@router.get("/", response_model=PaginatedNotebooks)
def list_notebooks(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    query = db.query(ResearchNotebook).join(ResearchNotebook.user)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (ResearchNotebook.name.ilike(search_filter)) |
            (ResearchNotebook.user.has(username=search_filter))
        )

    total = query.count()
    offset = (page - 1) * page_size
    notebooks = query.order_by(ResearchNotebook.created_at.desc()).offset(offset).limit(page_size).all()

    items = [
        NotebookResponse(
            id=nb.id,
            notebook_id=nb.notebook_id,
            name=nb.name,
            user_id=nb.user_id,
            username=nb.user.username,
            created_at=nb.created_at.isoformat() if nb.created_at else "",
        )
        for nb in notebooks
    ]

    return PaginatedNotebooks(items=items, total=total, page=page, page_size=page_size)


@router.delete("/{notebook_id}")
def delete_notebook(
    notebook_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    notebook = db.query(ResearchNotebook).filter(ResearchNotebook.id == notebook_id).first()
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")

    db.delete(notebook)
    db.commit()
    return {"ok": True}