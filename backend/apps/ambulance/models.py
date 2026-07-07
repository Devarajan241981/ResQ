"""Scaffold only — see docs/ROADMAP.md."""
from django.db import models

from apps.common.models import BaseModel, GeoLocationMixin


class AmbulanceRequestStatus(models.TextChoices):
    REQUESTED = "requested", "Requested"
    EN_ROUTE = "en_route", "En Route"
    ARRIVED = "arrived", "Arrived"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"


class AmbulanceRequest(BaseModel, GeoLocationMixin):
    requested_by = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="ambulance_requests")
    pickup_address = models.CharField(max_length=255)
    hospital = models.ForeignKey(
        "hospitals.Hospital", null=True, blank=True, on_delete=models.SET_NULL, related_name="ambulance_requests"
    )
    status = models.CharField(
        max_length=15, choices=AmbulanceRequestStatus.choices, default=AmbulanceRequestStatus.REQUESTED
    )
    notes = models.TextField(blank=True)

    class Meta:
        indexes = [models.Index(fields=["status"])]
