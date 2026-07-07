from django.db import models

from apps.common.models import BaseModel, GeoLocationMixin


class PoliceStation(BaseModel, GeoLocationMixin):
    name = models.CharField(max_length=200)
    station_code = models.CharField(max_length=50, unique=True)
    jurisdiction_area = models.CharField(max_length=255, blank=True)
    address = models.TextField()
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [models.Index(fields=["city", "is_active"])]

    def __str__(self):
        return f"{self.name} ({self.station_code})"


class ReportType(models.TextChoices):
    MISSING_PERSON = "missing_person", "Missing Person"
    MISSING_CHILD = "missing_child", "Missing Child"
    MISSING_ELDERLY = "missing_elderly", "Missing Elderly"
    SOS = "sos", "SOS"


class ForwardStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    SENT = "sent", "Sent"
    ACKNOWLEDGED = "acknowledged", "Acknowledged"
    FAILED = "failed", "Failed"


class CaseForwardRecord(BaseModel):
    """
    Logs an attempt to forward a case to a police station through the pluggable
    gateway in apps.police.gateways. No government API is called directly from
    here — see gateways.get_gateway() for the swappable integration point.
    """

    police_station = models.ForeignKey(PoliceStation, on_delete=models.CASCADE, related_name="forwarded_cases")
    report_type = models.CharField(max_length=20, choices=ReportType.choices)
    report_id = models.UUIDField(help_text="Primary key of the source report (polymorphic across report types).")
    status = models.CharField(max_length=15, choices=ForwardStatus.choices, default=ForwardStatus.PENDING)
    reference_number = models.CharField(max_length=100, blank=True, help_text="Reference issued by the police system.")
    notes = models.TextField(blank=True)

    class Meta:
        indexes = [models.Index(fields=["report_type", "report_id"])]
