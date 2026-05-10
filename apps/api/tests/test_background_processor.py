import pytest
from unittest.mock import patch, AsyncMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import uuid

from app.db.models import Base, ResearchSource, ResearchNotebook, ResearchSourceStatus, ResearchSourceType, User, UserRole
from app.services.background_processor import process_single_source, _handle_error, MAX_RETRIES
from app.services.research_service import get_pending_sources


@pytest.fixture
def db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def user(db):
    user = User(username="testuser", email="test@example.com", password_hash="hash", role=UserRole.user)
    db.add(user)
    db.commit()
    return user


@pytest.fixture
def notebook(db, user):
    nb = ResearchNotebook(user_id=user.id, notebook_id="nb-123", name="Test Notebook")
    db.add(nb)
    db.commit()
    return nb


@pytest.fixture
def pending_source(db, notebook):
    source = ResearchSource(
        notebook_id=notebook.id,
        source_type=ResearchSourceType.PDF,
        file_url="sources/test.pdf",
        file_name="test.pdf",
        status=ResearchSourceStatus.PENDING,
    )
    db.add(source)
    db.commit()
    return source


class TestProcessSingleSource:
    @pytest.mark.asyncio
    async def test_processes_pending_source_to_ready(self, db, pending_source, notebook):
        """PENDING source should transition to READY on successful NotebookLM call."""
        mock_result = {"id": "notebooklm-abc123"}

        with patch("app.services.background_processor.create_notebook", new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_result

            await process_single_source(pending_source.id, db)

            db.refresh(pending_source)
            assert pending_source.status == ResearchSourceStatus.READY
            assert pending_source.notebooklm_id == "notebooklm-abc123"

    @pytest.mark.asyncio
    async def test_skips_non_pending_source(self, db, pending_source):
        """Already READY source should be skipped."""
        pending_source.status = ResearchSourceStatus.READY
        db.commit()

        with patch("app.services.background_processor.create_notebook", new_callable=AsyncMock) as mock_create:
            await process_single_source(pending_source.id, db)
            mock_create.assert_not_called()

    @pytest.mark.asyncio
    async def test_marks_processing_before_api_call(self, db, pending_source, notebook):
        """Source status should be set to PROCESSING before calling NotebookLM."""
        call_order = []

        async def track_call(*args, **kwargs):
            db.refresh(pending_source)
            call_order.append(pending_source.status)
            return {"id": "nb-123"}

        with patch("app.services.background_processor.create_notebook", new_callable=AsyncMock, side_effect=track_call):
            await process_single_source(pending_source.id, db)

        assert call_order[0] == ResearchSourceStatus.PROCESSING

    @pytest.mark.asyncio
    async def test_retries_up_to_max_then_error(self, db, pending_source, notebook):
        """Failed calls should retry MAX_RETRIES times then mark ERROR."""
        pending_source.extra_data = {"retries": MAX_RETRIES}  # start at max to exhaust immediately
        db.commit()

        with patch("app.services.background_processor.create_notebook", new_callable=AsyncMock) as mock_create:
            mock_create.side_effect = Exception("API Error")

            await process_single_source(pending_source.id, db)

            db.refresh(pending_source)
            assert pending_source.status == ResearchSourceStatus.ERROR
            assert pending_source.extra_data["failed"] is True
            assert pending_source.extra_data["last_error"] == "API Error"
            assert mock_create.call_count == 1  # called once, immediately errored

    @pytest.mark.asyncio
    async def test_retry_count_persists_across_calls(self, db, pending_source, notebook):
        """Retry count in extra_data is read and incremented on failure."""
        pending_source.extra_data = {"retries": 1}  # will be incremented to 2 on failure
        db.commit()

        with patch("app.services.background_processor.create_notebook", new_callable=AsyncMock) as mock_create:
            mock_create.side_effect = Exception("API Error")

            await process_single_source(pending_source.id, db)

            db.refresh(pending_source)
            # 1 failure: retries 1 < MAX_RETRIES, so status = PENDING, retries becomes 2
            assert pending_source.status == ResearchSourceStatus.PENDING
            assert pending_source.extra_data["retries"] == 2
            assert mock_create.call_count == 1

    @pytest.mark.asyncio
    async def test_full_url_constructed_for_non_http_file(self, db, pending_source, notebook):
        """Non-HTTP file URLs should be prefixed with S3 endpoint."""
        captured_url = None

        async def capture_url(file_url, name):
            nonlocal captured_url
            captured_url = file_url
            return {"id": "nb-123"}

        with patch("app.services.background_processor.create_notebook", new_callable=AsyncMock, side_effect=capture_url):
            with patch("app.services.background_processor.get_settings") as mock_settings:
                mock_settings.return_value.S3_ENDPOINT = "https://s3.example.com"
                mock_settings.return_value.S3_BUCKET = "my-bucket"
                await process_single_source(pending_source.id, db)

        assert captured_url == "https://s3.example.com/my-bucket/sources/test.pdf"

    @pytest.mark.asyncio
    async def test_http_urls_passed_through(self, db, notebook):
        """HTTP URLs should be passed directly without modification."""
        source = ResearchSource(
            notebook_id=notebook.id,
            source_type=ResearchSourceType.URL,
            file_url="https://example.com/paper.pdf",
            file_name="Paper",
            status=ResearchSourceStatus.PENDING,
        )
        db.add(source)
        db.commit()

        captured_url = None

        async def capture_url(file_url, name):
            nonlocal captured_url
            captured_url = file_url
            return {"id": "nb-123"}

        with patch("app.services.background_processor.create_notebook", new_callable=AsyncMock, side_effect=capture_url):
            await process_single_source(source.id, db)

        assert captured_url == "https://example.com/paper.pdf"

    @pytest.mark.asyncio
    async def test_returns_early_for_missing_source(self, db):
        """Non-existent source ID should return without error."""
        fake_id = uuid.uuid4()

        with patch("app.services.background_processor.create_notebook", new_callable=AsyncMock) as mock_create:
            await process_single_source(fake_id, db)
            mock_create.assert_not_called()


class TestGetPendingSources:
    def test_returns_only_pending_sources(self, db, notebook):
        """Should return only PENDING sources."""
        pending1 = ResearchSource(notebook_id=notebook.id, source_type=ResearchSourceType.PDF, status=ResearchSourceStatus.PENDING)
        pending2 = ResearchSource(notebook_id=notebook.id, source_type=ResearchSourceType.PDF, status=ResearchSourceStatus.PENDING)
        ready = ResearchSource(notebook_id=notebook.id, source_type=ResearchSourceType.PDF, status=ResearchSourceStatus.READY)
        db.add_all([pending1, pending2, ready])
        db.commit()

        result = get_pending_sources(db)
        assert len(result) == 2
        assert all(s.status == ResearchSourceStatus.PENDING for s in result)


class TestHandleError:
    def test_retries_when_under_max(self, db, pending_source):
        """Should reset to PENDING when retries < MAX_RETRIES."""
        _handle_error(db, pending_source, retries=1, message="Error")

        db.refresh(pending_source)
        assert pending_source.status == ResearchSourceStatus.PENDING
        assert pending_source.extra_data["retries"] == 2
        assert pending_source.extra_data["last_error"] == "Error"

    def test_marks_error_when_max_retries_exceeded(self, db, pending_source):
        """Should mark ERROR when retries >= MAX_RETRIES."""
        _handle_error(db, pending_source, retries=MAX_RETRIES, message="Final error")

        db.refresh(pending_source)
        assert pending_source.status == ResearchSourceStatus.ERROR
        assert pending_source.extra_data["failed"] is True
        assert pending_source.extra_data["last_error"] == "Final error"