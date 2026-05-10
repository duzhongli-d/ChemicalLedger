import os
import uuid
import asyncio
import httpx
import json
from pathlib import Path
from typing import Optional, AsyncGenerator

from sqlalchemy.orm import Session

from app.db.models import ResearchSource, ResearchSourceType, ResearchSourceStatus, ResearchNotebook
from app.core.config import get_settings


UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def list_sources(db: Session, notebook_id: uuid.UUID) -> list[ResearchSource]:
    """List all sources for a notebook."""
    return (
        db.query(ResearchSource)
        .filter(ResearchSource.notebook_id == notebook_id)
        .order_by(ResearchSource.created_at.desc())
        .all()
    )


def create_source(
    db: Session,
    notebook_id: uuid.UUID,
    source_type: str,
    file_url: Optional[str] = None,
    file_name: Optional[str] = None,
    file_size: Optional[int] = None,
    extra_data: Optional[dict] = None,
) -> ResearchSource:
    """Create a new research source."""
    source = ResearchSource(
        notebook_id=notebook_id,
        source_type=source_type,
        file_url=file_url,
        file_name=file_name,
        file_size=file_size,
        status=ResearchSourceStatus.PENDING,
        extra_data=extra_data,
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return source


def get_source(db: Session, source_id: uuid.UUID) -> Optional[ResearchSource]:
    """Get a source by ID."""
    return db.query(ResearchSource).filter(ResearchSource.id == source_id).first()


def get_pending_sources(db: Session) -> list[ResearchSource]:
    """Get all sources with PENDING status."""
    return db.query(ResearchSource).filter(
        ResearchSource.status == ResearchSourceStatus.PENDING
    ).all()


def delete_source(db: Session, source_id: uuid.UUID) -> bool:
    """Delete a source."""
    source = get_source(db, source_id)
    if not source:
        return False

    # Delete file if exists
    if source.file_url and source.source_type != ResearchSourceType.URL:
        try:
            file_path = UPLOAD_DIR / source.file_url
            if file_path.exists():
                file_path.unlink()
        except OSError:
            pass

    db.delete(source)
    db.commit()
    return True


def save_uploaded_file(file_content: bytes, original_filename: str) -> tuple[str, int]:
    """Save an uploaded file and return (relative_url, file_size)."""
    ext = Path(original_filename).suffix.lower()
    unique_name = f"{uuid.uuid4()}{ext}"
    relative_url = f"sources/{unique_name}"
    file_path = UPLOAD_DIR / relative_url
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_bytes(file_content)
    return relative_url, len(file_content)


def update_source_status(
    db: Session, source_id: uuid.UUID, status: str, notebooklm_id: Optional[str] = None
) -> Optional[ResearchSource]:
    """Update the status of a source."""
    source = get_source(db, source_id)
    if not source:
        return None
    source.status = status
    if notebooklm_id:
        source.notebooklm_id = notebooklm_id
    db.commit()
    db.refresh(source)
    return source


async def stream_chat_response(notebook_id: str, question: str, sources: list[ResearchSource]) -> AsyncGenerator[str, None]:
    """Generate a streaming chat response using Gemini API."""
    settings = get_settings()

    if not settings.GEMINI_API_KEY:
        # Fallback to mock streaming response for development
        async def mock_stream():
            response = (
                "I'm a mock research assistant. In production, I would use the Gemini API "
                "to answer your question based on the uploaded sources. "
                f"You asked: {question}\n\n"
                f"I found {len(sources)} sources in this notebook.\n\n"
                "Please configure GEMINI_API_KEY in your environment to enable real AI responses."
            )
            for chunk in response.split():
                yield f"data: {json.dumps({'text': chunk + ' '})}\n\n"
                await asyncio.sleep(0.05)
            yield "data: [DONE]\n\n"

        return mock_stream()

    # Prepare context from sources with index for citations
    source_context = []
    for idx, src in enumerate(sources, start=1):
        context_item = {
            "index": idx,
            "type": src.source_type.lower(),
            "name": src.file_name or "Untitled",
            "url": src.file_url,
        }
        source_context.append(context_item)

    # Build the prompt with citation instructions
    citation_instruction = (
        "IMPORTANT: When referencing a source, you MUST use the citation format: "
        "[{source_index}: {source_filename}]. For example: 'According to the report [1: compound_data.pdf], the purity is 99.8%.' "
        "Only cite sources that you actually use. Use the source index from the list below."
        if sources else ""
    )
    prompt = f"""You are a research assistant. Answer the user's question based on the provided sources.

{citation_instruction}

Sources in this notebook (use index for citations):
{json.dumps(source_context, indent=2)}

User question: {question}

Provide a helpful, accurate response based on the sources available. Cite sources using [index: filename] format."""

    async def generate():
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{settings.GEMINI_BASE_URL}/v1beta/models/gemini-2.0-flash:streamGenerateContent",
                    params={"key": settings.GEMINI_API_KEY},
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": 0.7,
                            "maxOutputTokens": 2048,
                        },
                    },
                    timeout=60.0,
                )
                response.raise_for_status()

                async for line in response.aiter_lines():
                    if line.startswith("data:"):
                        yield line + "\n\n"

                yield "data: [DONE]\n\n"
            except httpx.HTTPError as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                yield "data: [DONE]\n\n"

    return generate()
