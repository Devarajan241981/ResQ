from django.db import models

from apps.common.models import BaseModel


class EventCategory(models.TextChoices):
    AWARENESS = "awareness", "Awareness Drive"
    BLOOD_DRIVE = "blood_drive", "Blood Donation Drive"
    RELIEF = "relief", "Relief Distribution"
    TRAINING = "training", "Training / Workshop"
    MEETING = "meeting", "Community Meeting"
    OTHER = "other", "Other"


class Event(BaseModel):
    """A community event published by a verified NGO/admin. Citizens RSVP to add it
    to their calendar and receive reminders/notifications."""

    created_by = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="events_created")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=EventCategory.choices, default=EventCategory.OTHER)
    event_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=120, blank=True)
    is_public = models.BooleanField(default=True)

    class Meta:
        ordering = ["event_date", "start_time"]
        indexes = [models.Index(fields=["event_date"])]

    def __str__(self) -> str:
        return f"{self.title} ({self.event_date})"


class EventRSVP(BaseModel):
    """A user's subscription to an event — their 'add to my calendar' record."""

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="rsvps")
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="event_rsvps")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["event", "user"], name="uniq_event_rsvp"),
        ]
