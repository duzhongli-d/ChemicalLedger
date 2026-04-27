import boto3
from app.core.config import get_settings


def get_s3_client():
    settings = get_settings()
    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
    )


def upload_file(file_bytes: bytes, key: str) -> str:
    client = get_s3_client()
    settings = get_settings()
    client.put_object(Bucket=settings.S3_BUCKET, Key=key, Body=file_bytes)
    return f"{settings.S3_ENDPOINT}/{settings.S3_BUCKET}/{key}"
