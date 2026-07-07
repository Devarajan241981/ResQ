"""Scaffold only — see docs/ROADMAP.md. Separate workflow with medical-condition support and a large emergency button."""
from django.db import models

from apps.common.models import BaseModel, GeoLocationMixin
from apps.missing_persons.models import Gender, MissingPersonStatus


class MissingElderlyReport(BaseModel, GeoLocationMixin):
    reported_by = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="missing_elderly_reports"
    )
    name = models.CharField(max_length=150)
    age = models.PositiveSmallIntegerField()
    gender = models.CharField(max_length=10, choices=Gender.choices)
    photo = models.ImageField(upload_to="missing_elderly/photos/", null=True, blank=True)

    has_dementia = models.BooleanField(default=False)
    has_alzheimers = models.BooleanField(default=False)
    medical_history = models.TextField(blank=True)

    last_seen_location = models.CharField(max_length=255)
    last_seen_at = models.DateTimeField()

    emergency_button_pressed = models.BooleanField(
        default=False, help_text="Set when the large in-app emergency button is used."
    )
    status = models.CharField(max_length=10, choices=MissingPersonStatus.choices, default=MissingPersonStatus.MISSING)

    class Meta:
        indexes = [models.Index(fields=["status"])]

    def __str__(self):
        return f"Elderly: {self.name} ({self.get_status_display()})"
