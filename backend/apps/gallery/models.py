from django.db import models

from apps.common.models import BaseModel


class GalleryImage(BaseModel):
    """A service/relief-work photo published by a verified NGO (or admin) to the public gallery."""

    uploaded_by = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="gallery_images")
    image = models.ImageField(upload_to="gallery/")
    caption = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.caption or f"Gallery image {self.id}"
