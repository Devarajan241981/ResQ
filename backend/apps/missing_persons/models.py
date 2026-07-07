import secrets

from django.contrib.postgres.fields import ArrayField
from django.db import models

from apps.common.models import BaseModel, GeoLocationMixin


class Gender(models.TextChoices):
    MALE = "male", "Male"
    FEMALE = "female", "Female"
    OTHER = "other", "Other"


class MissingPersonStatus(models.TextChoices):
    MISSING = "missing", "Missing"
    VERIFIED = "verified", "Verified"
    FOUND = "found", "Found"
    CLOSED = "closed", "Closed"


def _generate_slug() -> str:
    return secrets.token_urlsafe(8)


class MissingPersonReport(BaseModel, GeoLocationMixin):
    reported_by = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="missing_person_reports"
    )
    public_slug = models.SlugField(max_length=16, unique=True, default=_generate_slug, editable=False)

    name = models.CharField(max_length=150)
    age = models.PositiveSmallIntegerField()
    gender = models.CharField(max_length=10, choices=Gender.choices)
    height_cm = models.PositiveSmallIntegerField(null=True, blank=True)
    weight_kg = models.PositiveSmallIntegerField(null=True, blank=True)
    clothing_description = models.TextField(blank=True)

    last_seen_location = models.CharField(max_length=255)
    last_seen_at = models.DateTimeField()

    medical_conditions = models.TextField(blank=True)
    languages_spoken = ArrayField(models.CharField(max_length=50), default=list, blank=True)

    status = models.CharField(max_length=10, choices=MissingPersonStatus.choices, default=MissingPersonStatus.MISSING)

    face_embedding = models.JSONField(null=True, blank=True, help_text="Reserved for AI face-matching pipeline.")
    ai_summary = models.TextField(blank=True, help_text="Auto-generated report summary.")
    risk_score = models.DecimalField(max_digits=4, decimal_places=2, default=0)

    qr_code = models.ImageField(upload_to="missing_persons/qr_codes/", null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["public_slug"]),
            models.Index(fields=["name", "age"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"


class MissingPersonPhoto(BaseModel):
    report = models.ForeignKey(MissingPersonReport, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="missing_persons/photos/")

    class Meta:
        ordering = ["created_at"]


class EmergencyContact(BaseModel):
    report = models.ForeignKey(MissingPersonReport, on_delete=models.CASCADE, related_name="emergency_contacts")
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    relationship = models.CharField(max_length=50, blank=True)


class SightingReport(BaseModel, GeoLocationMixin):
    report = models.ForeignKey(MissingPersonReport, on_delete=models.CASCADE, related_name="sightings")
    reported_by = models.ForeignKey(
        "accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="sightings_reported"
    )
    description = models.TextField()
    location_text = models.CharField(max_length=255, blank=True)
    sighted_at = models.DateTimeField()
    photo = models.ImageField(upload_to="missing_persons/sightings/", null=True, blank=True)

    class Meta:
        ordering = ["-sighted_at"]
