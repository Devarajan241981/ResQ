from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

User = get_user_model()


@receiver(post_save, sender=User)
def send_welcome_notification(sender, instance, created, **kwargs):
    """
    Fires exactly once per new account regardless of which entry point created it
    (email register, OTP verify, or Google sign-in) — keeps the three views thin.
    """
    if not created:
        return

    from apps.notifications.models import NotificationType
    from apps.notifications.services import notify_user

    notify_user(
        instance,
        NotificationType.SYSTEM,
        title="Welcome to ResQ India",
        body="Your account is ready. Verify your phone to unlock reporting features.",
    )
