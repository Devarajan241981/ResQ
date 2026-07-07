from django.db import models

from apps.common.models import BaseModel, GeoLocationMixin


class ShelterType(models.TextChoices):
    GOVERNMENT = "government", "Government"
    NGO = "ngo", "NGO"
    TEMPORARY = "temporary", "Temporary"


class Shelter(BaseModel, GeoLocationMixin):
    name = models.CharField(max_length=200)
    shelter_type = models.CharField(max_length=20, choices=ShelterType.choices)
    address = models.TextField()
    city = models.CharField(max_length=100, db_index=True)
    capacity = models.PositiveIntegerField(default=0)
    current_occupancy = models.PositiveIntegerField(default=0)
    contact_phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    managed_by = models.ForeignKey(
        "accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="managed_shelters"
    )
    disaster_event = models.ForeignKey(
        "disaster_mode.DisasterEvent",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="shelters",
    )

    class Meta:
        ordering = ["name"]
        indexes = [models.Index(fields=["city", "is_active"])]

    @property
    def available_capacity(self) -> int:
        return max(0, self.capacity - self.current_occupancy)

    def __str__(self):
        return self.name
