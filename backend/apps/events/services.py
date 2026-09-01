from django.db import transaction

from apps.events.models import Event, EventRSVP
from apps.notifications.models import NotificationType
from apps.notifications.services import notify_user


def rsvp(event: Event, user) -> EventRSVP:
    """Subscribe a user to an event (idempotent). Confirms to the user and lets the
    organizer know someone is attending."""
    rsvp_obj, created = EventRSVP.objects.get_or_create(event=event, user=user)
    if created:
        transaction.on_commit(lambda: _notify_on_rsvp(event, user))
    return rsvp_obj


def _notify_on_rsvp(event: Event, user) -> None:
    data = {"event_id": str(event.id), "kind": "event_rsvp"}
    # Confirmation / reminder record for the attendee.
    notify_user(
        recipient=user,
        notification_type=NotificationType.EVENT_UPDATE,
        title=f"You're going to {event.title}",
        body=f"{event.get_category_display()} · {event.event_date:%d %b %Y}"
        + (f" · {event.location}" if event.location else ""),
        data=data,
    )
    # Let the organizer know, unless they RSVP'd to their own event.
    if event.created_by_id != user.id:
        notify_user(
            recipient=event.created_by,
            notification_type=NotificationType.EVENT_UPDATE,
            title=f"New attendee for {event.title}",
            body=f"{user.full_name} is attending.",
            data=data,
        )


def cancel_rsvp(event: Event, user) -> None:
    EventRSVP.objects.filter(event=event, user=user).delete()
