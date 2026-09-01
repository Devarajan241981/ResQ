import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import Role
from apps.accounts.tests.factories import UserFactory
from apps.campaigns.models import Campaign
from apps.community.models import Community

pytestmark = pytest.mark.django_db


def url(name, **kwargs):
    return reverse(f"analytics:{name}", kwargs=kwargs or None)


def _client_for(user):
    client = APIClient()
    token = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


def test_non_admin_cannot_view_summary():
    citizen = UserFactory()
    resp = _client_for(citizen).get(url("summary"))
    assert resp.status_code == 403


def test_admin_sees_platform_summary():
    admin = UserFactory(role=Role.ADMIN)
    ngo = UserFactory(role=Role.NGO, is_verified=False)
    verified_ngo = UserFactory(role=Role.NGO, is_verified=True)
    Campaign.objects.create(
        organizer=verified_ngo, title="Cleanup", category="awareness", city="Chennai", starts_at=timezone.now()
    )
    Community.objects.create(owner=verified_ngo, name="Updates", city="Chennai")

    resp = _client_for(admin).get(url("summary"))
    assert resp.status_code == 200
    assert resp.data["total_users"] == 3
    assert resp.data["pending_ngo_verifications"] == 1
    assert resp.data["published_campaigns"] == 1
    assert resp.data["total_communities"] == 1
    assert resp.data["users_by_role"]["ngo"] == 2
    assert ngo.is_verified is False
