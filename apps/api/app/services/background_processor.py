import uuid
import httpx
from sqlalchemy.orm import Session

from app.db.models import ResearchSource, ResearchSourceStatus
from app.services.research_service import update_source_status, get_source
from app.services.notebooklm_service import create_notebook
from app.core.config import get_settings

MAX_RETRIES = 3


async def process_single_source(source_id: uuid.UUID, db_session: Session) -> None:
    """Process a single PENDING source: call NotebookLM API, update status."""
    source = get_source(db_session, source_id)
    if not source:
        return

    if source.status != ResearchSourceStatus.PENDING:
        return

    # Mark as PROCESSING
    update_source_status(db_session, source_id, ResearchSourceStatus.PROCESSING)

    settings = get_settings()
    file_url = source.file_url
    if file_url and not file_url.startswith("http"):
        file_url = f"{settings.S3_ENDPOINT}/{settings.S3_BUCKET}/{source.file_url}"

    retries = (source.extra_data or {}).get("retries", 0)

    try:
        result = await create_notebook(file_url=file_url, name=source.file_name or "Untitled")
        notebooklm_id = result.get("id") or result.get("notebook_id")
        if not notebooklm_id:
            raise ValueError("No notebook ID returned from NotebookLM API")

        update_source_status(
            db_session, source_id,
            ResearchSourceStatus.READY,
            notebooklm_id=notebooklm_id,
        )
    except Exception as e:
        _handle_error(db_session, source, retries, str(e))


def _handle_error(db: Session, source: ResearchSource, retries: int, message: str) -> None:
    """Handle errors: retry or mark as ERROR."""
    if retries < MAX_RETRIES:
        source.status = ResearchSourceStatus.PENDING
        source.extra_data = {
            **(source.extra_data or {}),
            "retries": retries + 1,
            "last_error": message,
        }
    else:
        source.status = ResearchSourceStatus.ERROR
        source.extra_data = {
            **(source.extra_data or {}),
            "last_error": message,
            "failed": True,
        }
    db.commit()