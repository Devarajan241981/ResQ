from apps.notifications.models import Notification, NotificationChannel
from apps.notifications.tasks import broadcast_geo_alert, dispatch_notification


def notify_user(recipient, notification_type: str, title: str, body: str = "", data: dict | None = None,
                 channel: str = NotificationChannel.IN_APP) -> Notification:
    notification = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        channel=channel,
        title=title,
        body=body,
        data=data or {},
    )
    dispatch_notification.delay(str(notification.id))
    return notification


def notify_users_nearby(users, notification_type: str, title: str, body: str = "", data: dict | None = None):
    """Fan out a geo-targeted alert to a pre-filtered list of nearby users (see apps.common.geo)."""
    user_ids = [str(u.id) for u in users]
    if user_ids:
        broadcast_geo_alert.delay(user_ids, notification_type, title, body, data or {})
