import pytest
from unittest.mock import patch, MagicMock
import uuid

@pytest.fixture
def mock_db():
    return MagicMock()

def test_list_sources_returns_sources(mock_db):
    from app.services.research_service import list_sources
    mock_sources = [MagicMock(), MagicMock()]
    mock_db.query.return_value.filter.return_value.order_by.return_value.all.return_value = mock_sources
    result = list_sources(mock_db, uuid.uuid4())
    assert result == mock_sources

def test_create_source_returns_created_source(mock_db):
    from app.services.research_service import create_source
    mock_source = MagicMock()
    mock_db.add = MagicMock()
    mock_db.commit = MagicMock()
    mock_db.refresh = MagicMock()
    # db.refresh replaces the passed object with the one from DB
    def refresh_side_effect(obj):
        obj.id = uuid.uuid4()
        return obj
    mock_db.refresh.side_effect = refresh_side_effect
    result = create_source(mock_db, uuid.uuid4(), "PDF", "http://example.com/file.pdf", "file.pdf", 1024)
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    assert result.source_type == "PDF"

def test_delete_source_deletes_and_returns_true(mock_db):
    from app.services.research_service import delete_source
    mock_source = MagicMock()
    mock_source.file_url = "sources/file.pdf"
    mock_source.source_type = "PDF"
    mock_db.query.return_value.filter.return_value.first.return_value = mock_source
    with patch('pathlib.Path.exists', return_value=True):
        result = delete_source(mock_db, uuid.uuid4())
    assert result is True
    mock_db.delete.assert_called_once_with(mock_source)
    mock_db.commit.assert_called()

def test_delete_source_returns_false_when_not_found(mock_db):
    from app.services.research_service import delete_source
    mock_db.query.return_value.filter.return_value.first.return_value = None
    result = delete_source(mock_db, uuid.uuid4())
    assert result is False

def test_save_uploaded_file_writes_to_disk(mock_db):
    from app.services.research_service import save_uploaded_file
    with patch('pathlib.Path.write_bytes') as mock_write:
        url, size = save_uploaded_file(b"test content", "document.pdf")
        assert url.startswith("sources/")
        assert url.endswith(".pdf")
        assert size == 12

@pytest.mark.asyncio
async def test_stream_chat_response_no_api_key_uses_mock(mock_db):
    from app.services.research_service import stream_chat_response
    with patch('app.services.research_service.get_settings') as mock_settings:
        mock_settings.return_value.GEMINI_API_KEY = None
        mock_settings.return_value.GEMINI_BASE_URL = "https://api.gemini.example.com"
        mock_sources = [MagicMock(), MagicMock()]
        gen_coroutine = stream_chat_response("nb-123", "What is the CAS?", mock_sources)
        # stream_chat_response is async, so we need to await to get the async generator
        gen = await gen_coroutine
        chunks = []
        async for chunk in gen:
            chunks.append(chunk)
        assert len(chunks) > 0