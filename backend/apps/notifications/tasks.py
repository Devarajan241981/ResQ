import logging

from celery import shared_task
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger("resq")


@shared_task
def dispatch_notification(notification_id: str):
    from apps.notifications.models import Notification

    try:
        notification = Notification.objects.get(id=notification_id)
    except Notification.DoesNotExist:
        logger.warning("Notification %s no longer exists", notification_id)
        return

    if notification.channel in ("push", "sms", "email") and not settings.FIREBASE_SERVER_KEY:
        logger.info(
            "[NOTIFY-CONSOLE] (%s) %s: %s", notification.channel, notification.title, notification.body
        )

    notification.sent_at = timezone.now()
    notification.save(update_fields=["sent_at"])


@shared_task
def broadcast_geo_alert(user_ids: list[str], notification_type: str, title: str, body: str, data: dict):
    from apps.notifications.models import Notification

    notifications = [
        Notification(recipient_id=uid, notification_type=notification_type, title=title, body=body, data=data)
        for uid in user_ids
    ]
    created = Notification.objects.bulk_create(notifications)
    for notification in created:
        dispatch_notification.delay(str(notification.id))
