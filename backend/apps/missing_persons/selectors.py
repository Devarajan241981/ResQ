"""Read-only queries for missing_persons. No mutation happens here — see services.py for writes."""
from datetime import timedelta

from django.utils import timezone

from apps.missing_persons.models import MissingPersonReport


def get_report_queryset():
    return MissingPersonReport.objects.prefetch_related("photos", "emergency_contacts", "sightings")


def get_public_report_queryset():
    return MissingPersonReport.objects.prefetch_related("photos")


def find_possible_duplicates(report: MissingPersonReport, window_days: int = 14):
    """Fuzzy duplicate detection: same name+age reported again within a recent window."""
    window_start = report.created_at - timedelta(days=window_days) if report.created_at else timezone.now()
    return MissingPersonReport.objects.exclude(id=report.id).filter(
        name__iexact=report.name, age=report.age, created_at__gte=window_start
    )
