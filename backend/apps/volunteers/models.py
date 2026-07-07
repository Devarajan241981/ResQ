from django.contrib.postgres.fields import ArrayField
from django.db import models

from apps.common.models import BaseModel, GeoLocationMixin


class Skill(models.TextChoices):
    MEDICAL = "medical", "Medical"
    SEARCH_RESCUE = "search_rescue", "Search & Rescue"
    ANIMAL_RESCUE = "animal_rescue", "Animal Rescue"
    FOOD_DISTRIBUTION = "food_distribution", "Food Distribution"
    TRANSPORT = "transport", "Transport"


class VolunteerProfile(BaseModel, GeoLocationMixin):
    user = models.OneToOneField("accounts.User", on_delete=models.CASCADE, related_name="volunteer_profile")
    skills = ArrayField(models.CharField(max_length=30, choices=Skill.choices), default=list, blank=True)
    is_verified = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    reputation_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    completed_tasks = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True)
    last_active_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["is_verified", "is_available"])]

    def __str__(self):
        return f"Volunteer: {self.user}"
