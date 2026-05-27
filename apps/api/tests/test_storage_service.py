import pytest
from unittest.mock import patch, MagicMock


def test_get_s3_client_returns_boto3_client():
    from app.services.storage_service import get_s3_client
    with patch('app.services.storage_service.get_settings') as mock_settings:
        mock_settings.return_value.S3_ENDPOINT = "https://s3.example.com"
        mock_settings.return_value.S3_ACCESS_KEY = "test-key"
        mock_settings.return_value.S3_SECRET_KEY = "test-secret"
        with patch('app.services.storage_service.boto3.client') as mock_boto:
            mock_boto.return_value = MagicMock()
            result = get_s3_client()
            mock_boto.assert_called_once_with(
                "s3",
                endpoint_url="https://s3.example.com",
                aws_access_key_id="test-key",
                aws_secret_access_key="test-secret",
            )


def test_upload_file_calls_put_object_and_returns_url():
    from app.services.storage_service import upload_file
    with patch('app.services.storage_service.get_s3_client') as mock_client, \
         patch('app.services.storage_service.get_settings') as mock_settings:
        mock_client.return_value = MagicMock()
        mock_settings.return_value.S3_ENDPOINT = "https://s3.example.com"
        mock_settings.return_value.S3_BUCKET = "test-bucket"
        result = upload_file(b"file content", "sources/test.pdf")
        assert result == "https://s3.example.com/test-bucket/sources/test.pdf"
        mock_client.return_value.put_object.assert_called_once_with(
            Bucket="test-bucket",
            Key="sources/test.pdf",
            Body=b"file content",
        )