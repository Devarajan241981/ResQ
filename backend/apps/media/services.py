"""S3-compatible direct-upload support, used when settings.USE_S3 is enabled."""
import uuid

import boto3
from django.conf import settings

from apps.common.exceptions import DomainError


class MediaStorageNotConfiguredError(DomainError):
    default_message = "Direct upload is not enabled on this server."
    status_code = 501


def get_presigned_upload_url(content_type: str, folder: str = "uploads") -> dict:
    if not settings.USE_S3:
        raise MediaStorageNotConfiguredError()

    key = f"{folder}/{uuid.uuid4()}"
    client = boto3.client("s3", endpoint_url=getattr(settings, "AWS_S3_ENDPOINT_URL", None))
    url = client.generate_presigned_url(
        "put_object",
        Params={"Bucket": settings.AWS_STORAGE_BUCKET_NAME, "Key": key, "ContentType": content_type},
        ExpiresIn=300,
    )
    return {"upload_url": url, "key": key}
