from django.db import models

from apps.common.models import BaseModel, GeoLocationMixin


class SOSStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    RESOLVED = "resolved", "Resolved"
    CANCELLED = "cancelled", "Cancelled"


class TrustedContact(BaseModel):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="trusted_contacts")
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    relationship = models.CharField(max_length=50, blank=True)

    class Meta:
        indexes = [models.Index(fields=["user"])]


class SOSAlert(BaseModel, GeoLocationMixin):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="sos_alerts")
    status = models.CharField(max_length=10, choices=SOSStatus.choices, default=SOSStatus.ACTIVE)
    notes = models.TextField(blank=True)
    media = models.FileField(upload_to="sos/media/", null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["user", "status"])]


class SOSLocationPing(BaseModel, GeoLocationMixin):
    alert = models.ForeignKey(SOSAlert, on_delete=models.CASCADE, related_name="pings")
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-recorded_at"]
