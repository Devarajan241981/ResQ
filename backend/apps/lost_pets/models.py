"""Scaffold only — see docs/ROADMAP.md."""
from django.db import models

from apps.common.models import BaseModel, GeoLocationMixin


class PetStatus(models.TextChoices):
    LOST = "lost", "Lost"
    FOUND = "found", "Found"
    CLOSED = "closed", "Closed"


class LostPetReport(BaseModel, GeoLocationMixin):
    reported_by = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="lost_pet_reports")
    pet_name = models.CharField(max_length=100, blank=True)
    species = models.CharField(max_length=50)
    breed = models.CharField(max_length=100, blank=True)
    color = models.CharField(max_length=100, blank=True)

    last_seen_location = models.CharField(max_length=255)
    last_seen_at = models.DateTimeField()

    reward_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=10, choices=PetStatus.choices, default=PetStatus.LOST)

    class Meta:
        indexes = [models.Index(fields=["status", "species"])]

    def __str__(self):
        return f"{self.species}: {self.pet_name or 'unnamed'} ({self.get_status_display()})"


class LostPetPhoto(BaseModel):
    report = models.ForeignKey(LostPetReport, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="lost_pets/photos/")
