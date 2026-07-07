from django.conf import settings

from apps.common.geo import filter_within_radius
from apps.common.sms import send_sms
from apps.notifications.models import NotificationChannel, NotificationType
from apps.notifications.services import notify_user, notify_users_nearby
from apps.sos.models import SOSAlert
from apps.volunteers.models import VolunteerProfile


def notify_trusted_contacts(alert: SOSAlert) -> None:
    """Trusted contacts are phone numbers, not necessarily platform users, so this dispatches SMS directly."""
    for contact in alert.user.trusted_contacts.all():
        message = (
            f"{alert.user.full_name or 'A ResQ user'} has triggered an SOS alert. "
            f"Last known location: {alert.latitude}, {alert.longitude}."
        )
        send_sms(contact.phone, message)


def notify_nearby_volunteers(alert: SOSAlert, radius_km: int | None = None) -> None:
    if alert.latitude is None or alert.longitude is None:
        return

    radius_km = radius_km or settings.DEFAULT_NOTIFICATION_RADIUS_KM
    nearby_profiles = filter_within_radius(
        VolunteerProfile.objects.filter(is_verified=True, is_available=True).select_related("user"),
        float(alert.latitude),
        float(alert.longitude),
        radius_km,
    )
    notify_users_nearby(
        [p.user for p in nearby_profiles],
        NotificationType.SOS_ALERT,
        title="Nearby SOS alert",
        body=f"Someone near you needs help ({radius_km} km radius).",
        data={"sos_alert_id": str(alert.id)},
    )


def trigger_sos(alert: SOSAlert) -> None:
    notify_trusted_contacts(alert)
    notify_nearby_volunteers(alert)
    notify_user(
        alert.user,
        NotificationType.SOS_ALERT,
        title="SOS alert sent",
        body="Your trusted contacts and nearby volunteers have been notified.",
        channel=NotificationChannel.IN_APP,
        data={"sos_alert_id": str(alert.id)},
    )
