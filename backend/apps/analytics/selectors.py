"""Read-only aggregation queries powering the admin/super-admin dashboards."""
from django.db.models import Count


def platform_summary() -> dict:
    from apps.accounts.models import Role, User
    from apps.blood_donation.models import BloodRequest, BloodRequestStatus
    from apps.campaigns.models import Campaign, CampaignStatus
    from apps.community.models import Community
    from apps.disaster_mode.models import DisasterEvent, DisasterEventStatus
    from apps.missing_persons.models import MissingPersonReport
    from apps.sos.models import SOSAlert, SOSStatus
    from apps.volunteers.models import VolunteerProfile

    return {
        "users_by_role": dict(User.objects.values_list("role").annotate(count=Count("id"))),
        "total_users": User.objects.count(),
        "pending_ngo_verifications": User.objects.filter(role=Role.NGO, is_verified=False).count(),
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
        "campaigns_by_status": dict(Campaign.objects.values_list("status").annotate(count=Count("id"))),
        "published_campaigns": Campaign.objects.filter(status=CampaignStatus.PUBLISHED).count(),
        "total_communities": Community.objects.filter(is_active=True).count(),
    }
