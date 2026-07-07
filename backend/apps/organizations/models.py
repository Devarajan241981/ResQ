"""Scaffold only — see docs/ROADMAP.md. Generic partner-org registry (NGOs/hospitals/CSR/govt bodies)."""
from django.db import models

from apps.common.models import BaseModel, GeoLocationMixin


class OrganizationType(models.TextChoices):
    NGO = "ngo", "NGO"
    HOSPITAL = "hospital", "Hospital"
    GOVERNMENT = "government", "Government"
    CORPORATE = "corporate", "Corporate"
    OTHER = "other", "Other"


class Organization(BaseModel, GeoLocationMixin):
    name = models.CharField(max_length=200)
    org_type = models.CharField(max_length=20, choices=OrganizationType.choices)
    registration_number = models.CharField(max_length=100, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=100, db_index=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name
