"""
Scaffold only — see docs/ROADMAP.md.
Separate workflow from apps.missing_persons: extra verification + priority alerts,
with a school-integration hook reserved for a future phase.
"""
from django.db import models

from apps.common.models import BaseModel, GeoLocationMixin
from apps.missing_persons.models import Gender, MissingPersonStatus


class MissingChildReport(BaseModel, GeoLocationMixin):
    reported_by = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="missing_child_reports"
    )
    name = models.CharField(max_length=150)
    age = models.PositiveSmallIntegerField()
    gender = models.CharField(max_length=10, choices=Gender.choices)
    photo = models.ImageField(upload_to="missing_children/photos/", null=True, blank=True)

    guardian_name = models.CharField(max_length=150)
    guardian_phone = models.CharField(max_length=20)

    last_seen_location = models.CharField(max_length=255)
    last_seen_at = models.DateTimeField()

    school_name = models.CharField(max_length=200, blank=True, help_text="Reserved for future school integration.")

    status = models.CharField(max_length=10, choices=MissingPersonStatus.choices, default=MissingPersonStatus.MISSING)
    is_extra_verified = models.BooleanField(
        default=False, help_text="Set by admin after the mandatory extra verification step for child reports."
    )
    priority_alert_sent = models.BooleanField(default=False)

    class Meta:
        indexes = [models.Index(fields=["status"])]

    def __str__(self):
        return f"Child: {self.name} ({self.get_status_display()})"
