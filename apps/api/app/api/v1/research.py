import os
import asyncio
import json
import httpx
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, Body, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import date
from uuid import UUID
from typing import Optional
from app.db.session import get_db
from app.db.models import User, ResearchNotebook, DailyUsage, UserRole, ResearchSource, ResearchSourceType, ResearchSourceStatus, DailyUsage
from app.schemas.schemas import QuotaResponse
from app.api.deps import get_current_user_required
from app.services import research_service
from app.services.background_processor import process_single_source
from app.core.config import get_settings

router = APIRouter()

NOTEBOOKS_LIMIT = 3
DAILY_QUESTION_LIMIT = 10


@router.get("/quota", response_model=QuotaResponse)
def get_quota(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    today = date.today()
    usage = (
        db.query(DailyUsage)
        .filter(DailyUsage.user_id == current_user.id, DailyUsage.date == today)
        .first()
    )
    used_today = usage.question_count if usage else 0

    notebooks_count = db.query(ResearchNotebook).filter(ResearchNotebook.user_id == current_user.id).count()

    limit = 999999 if current_user.role == UserRole.admin else DAILY_QUESTION_LIMIT

    return QuotaResponse(
        used_today=used_today,
        limit=limit,
        notebooks_count=notebooks_count,
        notebooks_limit=999999 if current_user.role == UserRole.admin else NOTEBOOKS_LIMIT,
    )


@router.get("/notebooks")
def list_notebooks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    return (
        db.query(ResearchNotebook)
        .filter(ResearchNotebook.user_id == current_user.id)
        .order_by(ResearchNotebook.created_at.desc())
        .all()
    )


@router.post("/notebooks")
def create_notebook(
    notebook_id: str,
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    nb = ResearchNotebook(user_id=current_user.id, notebook_id=notebook_id, name=name)
    db.add(nb)
    db.commit()
    db.refresh(nb)
    return nb


@router.delete("/notebooks/{notebook_id}")
def delete_notebook(
    notebook_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    nb = db.query(ResearchNotebook).filter(
        ResearchNotebook.notebook_id == notebook_id,
        ResearchNotebook.user_id == current_user.id,
    ).first()
    if not nb:
        raise HTTPException(status_code=404, detail="Notebook not found")
    db.delete(nb)
    db.commit()
    return {"ok": True}


# ─── Sources ──────────────────────────────────────────────────────────────────


@router.get("/sources/{notebook_id}")
def list_sources(
    notebook_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    """List all sources for a notebook."""
    # Verify notebook belongs to user
    notebook = (
        db.query(ResearchNotebook)
        .filter(ResearchNotebook.id == notebook_id, ResearchNotebook.user_id == current_user.id)
        .first()
    )
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")

    sources = research_service.list_sources(db, notebook.id)
    return sources


@router.post("/sources/upload")
async def upload_source(
    notebook_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
    background_tasks: BackgroundTasks = None,
):
    """Upload a file source (PDF, TEXT, VIDEO, AUDIO)."""
    # Verify notebook belongs to user
    notebook = (
        db.query(ResearchNotebook)
        .filter(ResearchNotebook.id == notebook_id, ResearchNotebook.user_id == current_user.id)
        .first()
    )
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")

    # Determine source type from MIME type
    content_type = file.content_type or ""
    if content_type == "application/pdf" or file.filename.endswith(".pdf"):
        source_type = ResearchSourceType.PDF
    elif content_type.startswith("text/") or file.filename.endswith((".txt", ".md", ".csv")):
        source_type = ResearchSourceType.TEXT
    elif content_type.startswith("video/"):
        source_type = ResearchSourceType.VIDEO
    elif content_type.startswith("audio/"):
        source_type = ResearchSourceType.AUDIO
    else:
        source_type = ResearchSourceType.TEXT

    # Save file
    file_content = await file.read()
    relative_url, file_size = research_service.save_uploaded_file(
        file_content, file.filename or "upload"
    )

    # Create source record
    source = research_service.create_source(
        db=db,
        notebook_id=notebook.id,
        source_type=source_type,
        file_url=relative_url,
        file_name=file.filename,
        file_size=file_size,
        extra_data={"content_type": content_type},
    )
    background_tasks.add_task(process_single_source, source.id, db)
    return source


@router.post("/sources/add-url")
def add_url_source(
    notebook_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
    url: str = Body(...),
    title: Optional[str] = Body(None),
    background_tasks: BackgroundTasks = None,
):
    """Add a URL source."""
    # Verify notebook belongs to user
    notebook = (
        db.query(ResearchNotebook)
        .filter(ResearchNotebook.id == notebook_id, ResearchNotebook.user_id == current_user.id)
        .first()
    )
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")

    source = research_service.create_source(
        db=db,
        notebook_id=notebook.id,
        source_type=ResearchSourceType.URL,
        file_url=url,
        file_name=title or url,
        extra_data={"url": url},
    )
    background_tasks.add_task(process_single_source, source.id, db)
    return source


@router.delete("/sources/{source_id}")
def delete_source(
    source_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    """Delete a source."""
    # Get source and verify ownership
    source = db.query(ResearchSource).filter(ResearchSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    notebook = (
        db.query(ResearchNotebook)
        .filter(ResearchNotebook.id == source.notebook_id, ResearchNotebook.user_id == current_user.id)
        .first()
    )
    if not notebook:
        raise HTTPException(status_code=403, detail="Not authorized to delete this source")

    research_service.delete_source(db, source_id)
    return {"message": "Source deleted successfully"}


@router.post("/sources/{source_id}/process")
async def trigger_source_processing(
    source_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
    background_tasks: BackgroundTasks = None,
):
    """Manually trigger NotebookLM processing for a single source."""
    source = db.query(ResearchSource).filter(ResearchSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    notebook = db.query(ResearchNotebook).filter(
        ResearchNotebook.id == source.notebook_id,
        ResearchNotebook.user_id == current_user.id,
    ).first()
    if not notebook:
        raise HTTPException(status_code=403, detail="Not authorized")

    if source.status == ResearchSourceStatus.READY:
        return {"message": "Already processed", "notebooklm_id": source.notebooklm_id}

    # Reset ERROR status for manual retry
    if source.status == ResearchSourceStatus.ERROR:
        source.status = ResearchSourceStatus.PENDING
        source.extra_data = {**(source.extra_data or {}), "retries": 0}
        db.commit()

    background_tasks.add_task(process_single_source, source_id, db)
    return {"message": "Processing started"}


@router.post("/sources/process-pending")
async def trigger_all_pending(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
    background_tasks: BackgroundTasks = None,
):
    """Batch trigger processing for all PENDING sources (admin only)."""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin only")

    pending = db.query(ResearchSource).filter(
        ResearchSource.status == ResearchSourceStatus.PENDING
    ).all()

    for source in pending:
        background_tasks.add_task(process_single_source, source.id, db)

    return {"message": f"Queued {len(pending)} sources"}


@router.get("/sources/{source_id}/status")
def get_source_status(
    source_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    """Get current processing status of a source."""
    source = db.query(ResearchSource).filter(ResearchSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return {
        "status": source.status,
        "notebooklm_id": source.notebooklm_id,
        "extra_data": source.extra_data,
    }


# ─── Chat ─────────────────────────────────────────────────────────────────────


@router.post("/chat")
async def chat(
    notebook_id: UUID,
    question: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    """Stream a chat response using SSE."""
    # Verify notebook belongs to user
    notebook = (
        db.query(ResearchNotebook)
        .filter(ResearchNotebook.id == notebook_id, ResearchNotebook.user_id == current_user.id)
        .first()
    )
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")

    # Check and update daily usage
    today = date.today()
    usage = db.query(DailyUsage).filter(
        DailyUsage.user_id == current_user.id, DailyUsage.date == today
    ).first()

    if current_user.role != UserRole.admin:
        if usage and usage.question_count >= DAILY_QUESTION_LIMIT:
            raise HTTPException(status_code=429, detail="Daily question limit reached")

    if usage:
        usage.question_count += 1
    else:
        usage = DailyUsage(user_id=current_user.id, date=today, question_count=1)
        db.add(usage)
    db.commit()

    # Get sources for context
    sources = research_service.list_sources(db, notebook_id)

    async def event_generator():
        stream = await research_service.stream_chat_response(
            str(notebook_id), question, sources
        )
        async for chunk in stream:
            yield chunk

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ─── Studio ───────────────────────────────────────────────────────────────────


@router.post("/studio/learning-guide")
async def generate_learning_guide(
    notebook_id: UUID,
    topic: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    """Generate a learning guide from notebook sources."""
    notebook = (
        db.query(ResearchNotebook)
        .filter(ResearchNotebook.id == notebook_id, ResearchNotebook.user_id == current_user.id)
        .first()
    )
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")

    sources = research_service.list_sources(db, notebook_id)
    settings = get_settings()

    if not settings.GEMINI_API_KEY:
        # Return mock data for development
        return {
            "title": f"Learning Guide: {topic}",
            "sections": [
                {
                    "heading": "Introduction",
                    "content": f"This is a mock learning guide about {topic}. Configure GEMINI_API_KEY for real content.",
                },
                {
                    "heading": "Key Concepts",
                    "content": "Key concepts would appear here when Gemini API is configured.",
                },
                {
                    "heading": "Summary",
                    "content": "This is a placeholder summary for development purposes.",
                },
            ],
        }

    # Prepare source context
    source_info = [{"name": s.file_name or "Untitled", "type": s.source_type, "url": s.file_url} for s in sources]
    prompt = f"""Based on the following sources from a research notebook, create a comprehensive learning guide about "{topic}".

Sources:
{json.dumps(source_info, indent=2)}

Create a learning guide with this exact JSON structure:
{{
  "title": "Learning Guide: {topic}",
  "sections": [
    {{ "heading": "Section Title", "content": "Section content..." }},
    ...
  ]
}}

Make the content informative and educational based on the sources provided."""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.GEMINI_BASE_URL}/v1beta/models/gemini-2.0-flash:generateContent",
            params={"key": settings.GEMINI_API_KEY},
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=60.0,
        )
        response.raise_for_status()
        data = response.json()
        text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        # Try to parse as JSON, fallback to mock
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {
                "title": f"Learning Guide: {topic}",
                "sections": [{"heading": "Overview", "content": text or f"Content about {topic}"}],
            }


@router.post("/studio/mindmap")
async def generate_mindmap(
    notebook_id: UUID,
    topic: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    """Generate a mind map from notebook sources."""
    notebook = (
        db.query(ResearchNotebook)
        .filter(ResearchNotebook.id == notebook_id, ResearchNotebook.user_id == current_user.id)
        .first()
    )
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")

    sources = research_service.list_sources(db, notebook_id)
    settings = get_settings()

    if not settings.GEMINI_API_KEY:
        return {
            "root": {
                "id": "root",
                "text": topic,
                "children": [
                    {"id": "1", "text": "Concept 1", "children": [{"id": "1a", "text": "Detail 1a"}]},
                    {"id": "2", "text": "Concept 2", "children": [{"id": "2a", "text": "Detail 2a"}]},
                ],
            }
        }

    source_info = [{"name": s.file_name or "Untitled", "type": s.source_type} for s in sources]
    prompt = f"""Based on the following sources, create a mind map about "{topic}".

Sources:
{json.dumps(source_info, indent=2)}

Create a mind map with this exact JSON structure:
{{
  "root": {{
    "id": "root",
    "text": "{topic}",
    "children": [
      {{ "id": "1", "text": "Main concept", "children": [{{ "id": "1a", "text": "Sub-concept" }}] }}
    ]
  }}
}}

Use short, concise text for each node."""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.GEMINI_BASE_URL}/v1beta/models/gemini-2.0-flash:generateContent",
                params={"key": settings.GEMINI_API_KEY},
                json={"contents": [{"parts": [{"text": prompt}]}]},
                timeout=60.0,
            )
            if response.status_code == 429:
                # Rate limited - return mock data
                return {
                    "root": {
                        "id": "root",
                        "text": topic,
                        "children": [
                            {"id": "1", "text": "概念1", "children": [{"id": "1a", "text": "子概念1a"}]},
                            {"id": "2", "text": "概念2", "children": [{"id": "2a", "text": "子概念2a"}]},
                        ],
                    }
                }
            response.raise_for_status()
            data = response.json()
            text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            return json.loads(text)
    except Exception as e:
        # On any error, return mock data so UI can display something
        return {
            "root": {
                "id": "root",
                "text": topic,
                "children": [
                    {"id": "1", "text": "概念1", "children": [{"id": "1a", "text": "子概念1a"}]},
                    {"id": "2", "text": "概念2", "children": [{"id": "2a", "text": "子概念2a"}]},
                ],
            }
        }


@router.post("/studio/ppt")
async def generate_ppt(
    notebook_id: UUID,
    topic: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    """Generate PPT data from notebook sources."""
    notebook = (
        db.query(ResearchNotebook)
        .filter(ResearchNotebook.id == notebook_id, ResearchNotebook.user_id == current_user.id)
        .first()
    )
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")

    sources = research_service.list_sources(db, notebook_id)
    settings = get_settings()

    if not settings.GEMINI_API_KEY:
        return {
            "title": f"Presentation: {topic}",
            "slides": [
                {"title": "Slide 1", "bulletPoints": ["Point 1", "Point 2"]},
                {"title": "Slide 2", "bulletPoints": ["Point 3", "Point 4"]},
            ],
        }

    source_info = [{"name": s.file_name or "Untitled", "type": s.source_type} for s in sources]
    prompt = f"""Based on the following sources, create a PowerPoint outline about "{topic}".

Sources:
{json.dumps(source_info, indent=2)}

Create a PPT outline with this exact JSON structure:
{{
  "title": "Presentation: {topic}",
  "slides": [
    {{ "title": "Slide Title", "bulletPoints": ["Point 1", "Point 2", "Point 3"] }},
    ...
  ]
}}

Keep bullet points concise (5-7 words each)."""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.GEMINI_BASE_URL}/v1beta/models/gemini-2.0-flash:generateContent",
            params={"key": settings.GEMINI_API_KEY},
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=60.0,
        )
        response.raise_for_status()
        data = response.json()
        text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"title": f"Presentation: {topic}", "slides": [{"title": "Overview", "bulletPoints": [topic]}]}
