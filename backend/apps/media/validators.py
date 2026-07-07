"""Shared upload validation used by every app's photo/media upload endpoint."""
from django.core.exceptions import ValidationError

ALLOWED_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


def validate_image_file(uploaded_file) -> None:
    if uploaded_file.size > MAX_IMAGE_SIZE_BYTES:
        raise ValidationError(f"Image must be smaller than {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)}MB.")

    content_type = getattr(uploaded_file, "content_type", None)
    if content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise ValidationError("Only JPEG, PNG, or WEBP images are allowed.")

    from PIL import Image, UnidentifiedImageError

    try:
        image = Image.open(uploaded_file)
        image.verify()
    except UnidentifiedImageError as exc:
        raise ValidationError("File is not a valid image.") from exc
    finally:
        uploaded_file.seek(0)
