from django.db import models

from apps.common.models import BaseModel, GeoLocationMixin


class BloodGroup(models.TextChoices):
    A_POS = "A+", "A+"
    A_NEG = "A-", "A-"
    B_POS = "B+", "B+"
    B_NEG = "B-", "B-"
    AB_POS = "AB+", "AB+"
    AB_NEG = "AB-", "AB-"
    O_POS = "O+", "O+"
    O_NEG = "O-", "O-"


class Urgency(models.TextChoices):
    NORMAL = "normal", "Normal"
    URGENT = "urgent", "Urgent"
    CRITICAL = "critical", "Critical"


class BloodRequestStatus(models.TextChoices):
    OPEN = "open", "Open"
    FULFILLED = "fulfilled", "Fulfilled"
    EXPIRED = "expired", "Expired"
    CANCELLED = "cancelled", "Cancelled"


class DonorProfile(BaseModel, GeoLocationMixin):
    user = models.OneToOneField("accounts.User", on_delete=models.CASCADE, related_name="donor_profile")
    blood_group = models.CharField(max_length=3, choices=BloodGroup.choices)
    city = models.CharField(max_length=100, db_index=True)
    is_available = models.BooleanField(default=True)
    last_donated_at = models.DateField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["blood_group", "city", "is_available"])]

    def __str__(self):
        return f"{self.user} ({self.blood_group})"


class BloodRequest(BaseModel, GeoLocationMixin):
    requested_by = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="blood_requests")
    patient_name = models.CharField(max_length=150)
    blood_group = models.CharField(max_length=3, choices=BloodGroup.choices)
    units_needed = models.PositiveSmallIntegerField(default=1)
    hospital = models.ForeignKey(
        "hospitals.Hospital", null=True, blank=True, on_delete=models.SET_NULL, related_name="blood_requests"
    )
    city = models.CharField(max_length=100, db_index=True)
    urgency = models.CharField(max_length=10, choices=Urgency.choices, default=Urgency.NORMAL)
    status = models.CharField(max_length=10, choices=BloodRequestStatus.choices, default=BloodRequestStatus.OPEN)
    notes = models.TextField(blank=True)

    class Meta:
        indexes = [models.Index(fields=["blood_group", "city", "status"])]

    def __str__(self):
        return f"{self.blood_group} for {self.patient_name} ({self.get_status_display()})"


class ResponseStatus(models.TextChoices):
    OFFERED = "offered", "Offered"
    CONFIRMED = "confirmed", "Confirmed"
    DECLINED = "declined", "Declined"


class BloodRequestResponse(BaseModel):
    request = models.ForeignKey(BloodRequest, on_delete=models.CASCADE, related_name="responses")
    donor = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="blood_request_responses")
    status = models.CharField(max_length=10, choices=ResponseStatus.choices, default=ResponseStatus.OFFERED)

    class Meta:
        unique_together = ("request", "donor")
