import datetime

from apps.events.models import Event


def get_events_queryset():
    return Event.objects.select_related("created_by").filter(is_public=True)


def events_in_month(year: int, month: int):
    start = datetime.date(year, month, 1)
    end = datetime.date(year + 1, 1, 1) if month == 12 else datetime.date(year, month + 1, 1)
    return get_events_queryset().filter(event_date__gte=start, event_date__lt=end)
