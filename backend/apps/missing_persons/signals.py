from django.db.models.signals import pre_save
from django.dispatch import receiver

from apps.missing_persons.models import MissingPersonReport, MissingPersonStatus


@receiver(pre_save, sender=MissingPersonReport)
def notify_reporter_on_status_change(sender, instance: MissingPersonReport, **kwargs):
    """When a report flips to FOUND/CLOSED, tell the reporter — before the row commits."""
    if instance._state.adding or not instance.pk:
        return

    previous_status = sender.objects.filter(pk=instance.pk).values_list("status", flat=True).first()
    if previous_status == instance.status:
        return
    if instance.status not in (MissingPersonStatus.FOUND, MissingPersonStatus.CLOSED):
        return

    from apps.notifications.models import NotificationType
    from apps.notifications.services import notify_user

    notify_user(
        instance.reported_by,
        NotificationType.SYSTEM,
        title=f"Report update: {instance.name}",
        body=f"This missing person report is now marked as {instance.get_status_display()}.",
        data={"missing_person_report_id": str(instance.id)},
    )
