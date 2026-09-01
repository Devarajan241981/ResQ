import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import Role
from apps.accounts.tests.factories import UserFactory
from apps.campaigns.models import Campaign, CampaignRegistrationStatus, CampaignStatus

pytestmark = pytest.mark.django_db


def url(name, **kwargs):
    return reverse(f"campaigns:{name}", kwargs=kwargs or None)


def _client_for(user):
    """An independent, freshly-authenticated APIClient for `user`.

    Deliberately not reusing the `auth_client`/`make_auth_client` conftest
    fixtures together: they share one underlying `api_client` instance, so
    authenticating a second user through `make_auth_client` silently
    overwrites the credentials `auth_client` already set on that same
    object. Any test needing two distinct identities at once must build
    both clients this way instead.
    """
    client = APIClient()
    token = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


def _make_ngo(is_verified=True):
    return UserFactory(role=Role.NGO, is_verified=is_verified)


def _make_campaign(organizer, **overrides):
    defaults = dict(
        organizer=organizer,
        title="Beach Cleanup Drive",
        category="cleanliness_drive",
        city="Chennai",
        starts_at=timezone.now(),
    )
    defaults.update(overrides)
    return Campaign.objects.create(**defaults)


def test_citizen_cannot_create_campaign():
    citizen = UserFactory()
    resp = _client_for(citizen).post(
        url("campaign-list"),
        {"title": "Test Drive", "category": "awareness", "city": "Chennai", "starts_at": timezone.now().isoformat()},
    )
    assert resp.status_code == 403


def test_unverified_ngo_cannot_create_campaign():
    ngo = _make_ngo(is_verified=False)
    resp = _client_for(ngo).post(
        url("campaign-list"),
        {"title": "Test Drive", "category": "awareness", "city": "Chennai", "starts_at": timezone.now().isoformat()},
    )
    assert resp.status_code == 403


def test_verified_ngo_can_create_campaign():
    ngo = _make_ngo()
    resp = _client_for(ngo).post(
        url("campaign-list"),
        {
            "title": "Swachh Bharat Cleanup",
            "category": "cleanliness_drive",
            "city": "Chennai",
            "starts_at": timezone.now().isoformat(),
            "capacity": 50,
        },
    )
    assert resp.status_code == 201
    assert resp.data["status"] == CampaignStatus.PUBLISHED
    assert resp.data["organizer_name"] == ngo.full_name


def test_campaign_list_is_public():
    ngo = _make_ngo()
    _make_campaign(ngo)
    resp = APIClient().get(url("campaign-list"))
    assert resp.status_code == 200
    assert resp.data["count"] == 1


def test_only_organizer_can_close_their_campaign():
    ngo = _make_ngo()
    campaign = _make_campaign(ngo)
    citizen = UserFactory()

    resp = _client_for(citizen).post(url("campaign-close", pk=campaign.id))
    assert resp.status_code == 403


def test_organizer_can_close_own_campaign():
    ngo = _make_ngo()
    campaign = _make_campaign(ngo)

    resp = _client_for(ngo).post(url("campaign-close", pk=campaign.id))
    assert resp.status_code == 200
    assert resp.data["status"] == CampaignStatus.CLOSED


def test_authenticated_user_can_register_for_campaign():
    ngo = _make_ngo()
    campaign = _make_campaign(ngo)
    citizen = UserFactory()

    resp = _client_for(citizen).post(
        url("campaign-registration-list"),
        {"campaign": str(campaign.id), "full_name": citizen.full_name, "phone": "+919876500000"},
    )
    assert resp.status_code == 201
    assert resp.data["status"] == CampaignRegistrationStatus.REGISTERED


def test_cannot_register_twice_while_active():
    ngo = _make_ngo()
    campaign = _make_campaign(ngo)
    citizen = UserFactory()
    client = _client_for(citizen)
    payload = {"campaign": str(campaign.id), "full_name": citizen.full_name, "phone": "+919876500000"}

    first = client.post(url("campaign-registration-list"), payload)
    assert first.status_code == 201

    second = client.post(url("campaign-registration-list"), payload)
    assert second.status_code == 409
    assert second.data["code"] == "AlreadyRegisteredError"


def test_registration_blocked_once_capacity_is_full():
    ngo = _make_ngo()
    campaign = _make_campaign(ngo, capacity=1)

    filler = UserFactory()
    ok = _client_for(filler).post(
        url("campaign-registration-list"),
        {"campaign": str(campaign.id), "full_name": filler.full_name, "phone": "+919876511111"},
    )
    assert ok.status_code == 201

    latecomer = UserFactory()
    blocked = _client_for(latecomer).post(
        url("campaign-registration-list"),
        {"campaign": str(campaign.id), "full_name": latecomer.full_name, "phone": "+919876522222"},
    )
    assert blocked.status_code == 409
    assert blocked.data["code"] == "CapacityExceededError"


def test_registration_blocked_for_closed_campaign():
    ngo = _make_ngo()
    campaign = _make_campaign(ngo, status=CampaignStatus.CLOSED)
    citizen = UserFactory()

    resp = _client_for(citizen).post(
        url("campaign-registration-list"),
        {"campaign": str(campaign.id), "full_name": citizen.full_name, "phone": "+919876500000"},
    )
    assert resp.status_code == 403
    assert resp.data["code"] == "NotEligibleError"


def test_registrant_can_cancel_then_register_again():
    ngo = _make_ngo()
    campaign = _make_campaign(ngo)
    citizen = UserFactory()
    client = _client_for(citizen)
    payload = {"campaign": str(campaign.id), "full_name": citizen.full_name, "phone": "+919876500000"}

    created = client.post(url("campaign-registration-list"), payload)
    cancel_resp = client.post(url("campaign-registration-cancel", pk=created.data["id"]))
    assert cancel_resp.status_code == 200
    assert cancel_resp.data["status"] == CampaignRegistrationStatus.CANCELLED

    again = client.post(url("campaign-registration-list"), payload)
    assert again.status_code == 201


def test_organizer_sees_registrations_for_their_campaign():
    ngo = _make_ngo()
    campaign = _make_campaign(ngo)
    citizen = UserFactory()

    _client_for(citizen).post(
        url("campaign-registration-list"),
        {"campaign": str(campaign.id), "full_name": citizen.full_name, "phone": "+919876500000"},
    )

    resp = _client_for(ngo).get(url("campaign-registration-list"), {"campaign": str(campaign.id)})
    assert resp.status_code == 200
    assert resp.data["count"] == 1
