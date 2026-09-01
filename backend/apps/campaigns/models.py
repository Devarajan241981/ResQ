from django.db import models

from apps.common.models import BaseModel, GeoLocationMixin


class CampaignCategory(models.TextChoices):
    AWARENESS = "awareness", "Awareness Drive"
    HACKATHON = "hackathon", "Hackathon"
    CLEANLINESS_DRIVE = "cleanliness_drive", "Cleanliness Drive (Swachh Bharat)"
    BLOOD_CAMP = "blood_camp", "Blood Donation Camp"
    PLANTATION = "plantation", "Plantation Drive"
    RELIEF_COLLECTION = "relief_collection", "Relief Collection"
    OTHER = "other", "Other"


class CampaignStatus(models.TextChoices):
    PUBLISHED = "published", "Published"
    CLOSED = "closed", "Closed"
    CANCELLED = "cancelled", "Cancelled"


class Campaign(BaseModel, GeoLocationMixin):
    organizer = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="campaigns_organized")
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CampaignCategory.choices)
    description = models.TextField(blank=True)
    city = models.CharField(max_length=100, db_index=True)
    venue = models.CharField(max_length=255, blank=True)
    banner_image = models.ImageField(upload_to="campaigns/banners/", null=True, blank=True)
    capacity = models.PositiveIntegerField(null=True, blank=True)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField(null=True, blank=True)
    registration_deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=CampaignStatus.choices, default=CampaignStatus.PUBLISHED)

    class Meta:
        indexes = [models.Index(fields=["category", "status"]), models.Index(fields=["city"])]

    def __str__(self):
        return self.title


class CampaignRegistrationStatus(models.TextChoices):
    REGISTERED = "registered", "Registered"
    CANCELLED = "cancelled", "Cancelled"
    ATTENDED = "attended", "Attended"


class CampaignRegistration(BaseModel):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name="registrations")
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="campaign_registrations")
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    team_name = models.CharField(max_length=150, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=10, choices=CampaignRegistrationStatus.choices, default=CampaignRegistrationStatus.REGISTERED
    )

    class Meta:
        indexes = [models.Index(fields=["campaign", "user"])]

    def __str__(self):
        return f"{self.full_name} -> {self.campaign_id}"
