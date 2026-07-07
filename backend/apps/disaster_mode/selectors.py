"""Read-only queries for disaster_mode. No mutation happens here — see views for the write path."""
from apps.disaster_mode.models import StatusReport


def get_open_needs(event_id) -> int:
    return StatusReport.objects.filter(event_id=event_id, is_resolved=False).exclude(need_type="safe").count()
