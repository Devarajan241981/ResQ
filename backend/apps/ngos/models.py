"""Scaffold only — see docs/ROADMAP.md."""
from django.contrib.postgres.fields import ArrayField
from django.db import models

from apps.common.models import BaseModel, GeoLocationMixin


class NGOProfile(BaseModel, GeoLocationMixin):
    user = models.OneToOneField("accounts.User", on_delete=models.CASCADE, related_name="ngo_profile")
    org_name = models.CharField(max_length=200)
    registration_number = models.CharField(max_length=100, unique=True)
    focus_areas = ArrayField(models.CharField(max_length=50), default=list, blank=True)
    city = models.CharField(max_length=100, db_index=True)
    address = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.org_name
