from django.db import models

from apps.common.models import BaseModel, GeoLocationMixin


class DisasterType(models.TextChoices):
    FLOOD = "flood", "Flood"
    EARTHQUAKE = "earthquake", "Earthquake"
    FIRE = "fire", "Fire"
    CYCLONE = "cyclone", "Cyclone"


class DisasterEventStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    CONTAINED = "contained", "Contained"
    CLOSED = "closed", "Closed"


class DisasterEvent(BaseModel, GeoLocationMixin):
    name = models.CharField(max_length=200)
    disaster_type = models.CharField(max_length=20, choices=DisasterType.choices)
    description = models.TextField(blank=True)
    affected_area = models.CharField(max_length=255, blank=True)
    radius_km = models.DecimalField(max_digits=6, decimal_places=2, default=10)
    status = models.CharField(max_length=10, choices=DisasterEventStatus.choices, default=DisasterEventStatus.ACTIVE)
    created_by = models.ForeignKey(
        "accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="disaster_events_created"
    )
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["disaster_type", "status"])]

    def __str__(self):
        return f"{self.get_disaster_type_display()}: {self.name}"


class NeedType(models.TextChoices):
    SAFE = "safe", "Mark Safe"
    NEED_RESCUE = "need_rescue", "Need Rescue"
    NEED_FOOD = "need_food", "Need Food"
    NEED_WATER = "need_water", "Need Water"
    NEED_MEDICINE = "need_medicine", "Need Medicine"


class StatusReport(BaseModel, GeoLocationMixin):
    event = models.ForeignKey(DisasterEvent, on_delete=models.CASCADE, related_name="status_reports")
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="disaster_status_reports")
    need_type = models.CharField(max_length=20, choices=NeedType.choices)
    notes = models.TextField(blank=True)
    is_resolved = models.BooleanField(default=False)

    class Meta:
        indexes = [models.Index(fields=["event", "need_type", "is_resolved"])]


class AssignmentStatus(models.TextChoices):
    ASSIGNED = "assigned", "Assigned"
    EN_ROUTE = "en_route", "En Route"
    COMPLETED = "completed", "Completed"


class VolunteerAssignment(BaseModel):
    event = models.ForeignKey(DisasterEvent, on_delete=models.CASCADE, related_name="volunteer_assignments")
    volunteer = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="disaster_assignments")
    status_report = models.ForeignKey(
        StatusReport, null=True, blank=True, on_delete=models.SET_NULL, related_name="assignments"
    )
    status = models.CharField(max_length=10, choices=AssignmentStatus.choices, default=AssignmentStatus.ASSIGNED)
    assigned_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
