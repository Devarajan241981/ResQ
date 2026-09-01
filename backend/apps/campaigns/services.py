from django.db import transaction

from apps.campaigns import selectors
from apps.campaigns.models import Campaign, CampaignRegistration, CampaignStatus
from apps.common.exceptions import AlreadyRegisteredError, CapacityExceededError, NotEligibleError


def register_for_campaign(campaign: Campaign, user, data: dict) -> CampaignRegistration:
    """Enforces status/capacity/duplicate rules before creating a registration.

    Duplicate/capacity checks are deliberately done here (not a DB constraint)
    so a cancelled registrant can register again — a hard unique constraint on
    (campaign, user) would permanently lock them out after one cancellation.
    The campaign row is locked for the duration of the check-then-create so two
    concurrent requests can't both slip through when only one slot is left.
    """
    with transaction.atomic():
        locked_campaign = Campaign.objects.select_for_update().get(pk=campaign.pk)

        if locked_campaign.status != CampaignStatus.PUBLISHED:
            raise NotEligibleError("This campaign is not open for registration.")

        if selectors.get_existing_registration(locked_campaign.id, user.id):
            raise AlreadyRegisteredError()

        available = selectors.get_available_slots(locked_campaign)
        if available is not None and available <= 0:
            raise CapacityExceededError()

        registration = CampaignRegistration.objects.create(campaign=locked_campaign, user=user, **data)

        transaction.on_commit(lambda: _notify_organizer(locked_campaign, registration))

    return registration


def _notify_organizer(campaign: Campaign, registration: CampaignRegistration) -> None:
    from apps.notifications.models import NotificationType
    from apps.notifications.services import notify_user

    notify_user(
        campaign.organizer,
        NotificationType.CAMPAIGN_UPDATE,
        title=f"New registration for {campaign.title}",
        body=f"{registration.full_name} just registered for your campaign.",
        data={"campaign_id": str(campaign.id), "registration_id": str(registration.id)},
    )
