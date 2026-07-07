from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.disaster_mode.models import NeedType, StatusReport


@receiver(post_save, sender=StatusReport)
def notify_volunteers_on_rescue_need(sender, instance: StatusReport, created, **kwargs):
    """Auto-alert nearby verified volunteers the moment someone reports NEED_RESCUE."""
    if not created or instance.need_type != NeedType.NEED_RESCUE:
        return
    if instance.latitude is None or instance.longitude is None:
        return

    from apps.common.geo import filter_within_radius
    from apps.notifications.models import NotificationType
    from apps.notifications.services import notify_users_nearby
    from apps.volunteers.models import VolunteerProfile

    nearby = filter_within_radius(
        VolunteerProfile.objects.filter(is_verified=True, is_available=True).select_related("user"),
        float(instance.latitude),
        float(instance.longitude),
        radius_km=15,
    )
    notify_users_nearby(
        [p.user for p in nearby],
        NotificationType.DISASTER_ALERT,
        title="Rescue needed nearby",
        body=instance.notes or "Someone near you needs rescue during an active disaster event.",
        data={"status_report_id": str(instance.id), "event_id": str(instance.event_id)},
    )
