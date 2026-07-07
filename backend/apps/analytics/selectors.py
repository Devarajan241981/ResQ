"""Read-only aggregation queries powering the admin/super-admin dashboards."""
from django.db.models import Count


def platform_summary() -> dict:
    from apps.blood_donation.models import BloodRequest, BloodRequestStatus
    from apps.disaster_mode.models import DisasterEvent, DisasterEventStatus
    from apps.missing_persons.models import MissingPersonReport
    from apps.sos.models import SOSAlert, SOSStatus
    from apps.volunteers.models import VolunteerProfile

    return {
        "missing_persons_by_status": dict(
            MissingPersonReport.objects.values_list("status").annotate(count=Count("id"))
        ),
        "active_disaster_events": DisasterEvent.objects.filter(status=DisasterEventStatus.ACTIVE).count(),
        "open_blood_requests_by_urgency": dict(
            BloodRequest.objects.filter(status=BloodRequestStatus.OPEN)
            .values_list("urgency")
            .annotate(count=Count("id"))
        ),
        "active_sos_alerts": SOSAlert.objects.filter(status=SOSStatus.ACTIVE).count(),
        "verified_volunteers": VolunteerProfile.objects.filter(is_verified=True).count(),
    }
