from django.db import models

from apps.common.models import BaseModel, GeoLocationMixin


class HospitalType(models.TextChoices):
    GOVERNMENT = "government", "Government"
    PRIVATE = "private", "Private"
    TRAUMA_CENTER = "trauma_center", "Trauma Center"
    EMERGENCY = "emergency", "Emergency"


class Hospital(BaseModel, GeoLocationMixin):
    name = models.CharField(max_length=200)
    hospital_type = models.CharField(max_length=20, choices=HospitalType.choices)
    address = models.TextField()
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    phone = models.CharField(max_length=20)
    emergency_phone = models.CharField(max_length=20, blank=True)
    has_blood_bank = models.BooleanField(default=False)
    has_trauma_center = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    managed_by = models.ForeignKey(
        "accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="managed_hospitals"
    )

    class Meta:
        ordering = ["name"]
        indexes = [models.Index(fields=["city", "hospital_type"])]

    def __str__(self):
        return self.name
