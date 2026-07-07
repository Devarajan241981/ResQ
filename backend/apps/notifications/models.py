from django.db import models

from apps.common.models import BaseModel


class NotificationChannel(models.TextChoices):
    IN_APP = "in_app", "In-App"
    PUSH = "push", "Push"
    SMS = "sms", "SMS"
    EMAIL = "email", "Email"


class NotificationType(models.TextChoices):
    MISSING_PERSON_ALERT = "missing_person_alert", "Missing Person Alert"
    SOS_ALERT = "sos_alert", "SOS Alert"
    DISASTER_ALERT = "disaster_alert", "Disaster Alert"
    BLOOD_REQUEST = "blood_request", "Blood Request"
    VOLUNTEER_ASSIGNMENT = "volunteer_assignment", "Volunteer Assignment"
    SYSTEM = "system", "System"


class Notification(BaseModel):
    recipient = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    channel = models.CharField(max_length=10, choices=NotificationChannel.choices, default=NotificationChannel.IN_APP)
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["recipient", "is_read"])]

    def __str__(self):
        return f"{self.notification_type} -> {self.recipient_id}"
