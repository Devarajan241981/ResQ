"""Read-only queries for campaigns. No mutation happens here — see services for the write path."""
from apps.campaigns.models import CampaignRegistrationStatus


def get_active_registration_count(campaign_id) -> int:
    from apps.campaigns.models import CampaignRegistration

    return CampaignRegistration.objects.filter(
        campaign_id=campaign_id,
        status=CampaignRegistrationStatus.REGISTERED,
    ).count()


def get_available_slots(campaign) -> int | None:
    """Returns None when the campaign has no capacity limit (unlimited slots)."""
    if campaign.capacity is None:
        return None
    return max(0, campaign.capacity - get_active_registration_count(campaign.id))


def get_existing_registration(campaign_id, user_id):
    from apps.campaigns.models import CampaignRegistration

    return (
        CampaignRegistration.objects.filter(
            campaign_id=campaign_id, user_id=user_id, status=CampaignRegistrationStatus.REGISTERED
        )
        .first()
    )
