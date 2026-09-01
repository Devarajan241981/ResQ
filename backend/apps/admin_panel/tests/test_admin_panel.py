import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import Role
from apps.accounts.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


def url(name, **kwargs):
    return reverse(f"admin_panel:{name}", kwargs=kwargs or None)


def _client_for(user):
    client = APIClient()
    token = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


def test_citizen_cannot_list_users():
    citizen = UserFactory()
    resp = _client_for(citizen).get(url("admin-user-list"))
    assert resp.status_code == 403


def test_admin_can_list_users():
    admin = UserFactory(role=Role.ADMIN)
    UserFactory.create_batch(3)
    resp = _client_for(admin).get(url("admin-user-list"))
    assert resp.status_code == 200
    assert resp.data["count"] == 4  # admin + 3 citizens


def test_admin_can_filter_by_role():
    admin = UserFactory(role=Role.ADMIN)
    UserFactory(role=Role.NGO)
    UserFactory(role=Role.CITIZEN)
    resp = _client_for(admin).get(url("admin-user-list"), {"role": "ngo"})
    assert resp.status_code == 200
    assert resp.data["count"] == 1
    assert resp.data["results"][0]["role"] == "ngo"


def test_pending_ngo_verifications_excludes_verified_ngos():
    admin = UserFactory(role=Role.ADMIN)
    UserFactory(role=Role.NGO, is_verified=False)
    UserFactory(role=Role.NGO, is_verified=True)
    UserFactory(role=Role.CITIZEN, is_verified=False)

    resp = _client_for(admin).get(url("admin-user-pending-ngo-verifications"))
    assert resp.status_code == 200
    assert resp.data["count"] == 1
    assert resp.data["results"][0]["role"] == "ngo"


def test_admin_can_verify_a_user():
    admin = UserFactory(role=Role.ADMIN)
    ngo = UserFactory(role=Role.NGO, is_verified=False)

    resp = _client_for(admin).post(url("admin-user-verify", pk=ngo.id))
    assert resp.status_code == 200
    assert resp.data["is_verified"] is True

    ngo.refresh_from_db()
    assert ngo.is_verified is True


def test_admin_can_suspend_and_reactivate_a_user():
    admin = UserFactory(role=Role.ADMIN)
    citizen = UserFactory()

    suspend_resp = _client_for(admin).post(url("admin-user-suspend", pk=citizen.id))
    assert suspend_resp.status_code == 200
    assert suspend_resp.data["is_active"] is False

    reactivate_resp = _client_for(admin).post(url("admin-user-reactivate", pk=citizen.id))
    assert reactivate_resp.status_code == 200
    assert reactivate_resp.data["is_active"] is True


def test_reject_marks_unverified_and_inactive():
    admin = UserFactory(role=Role.ADMIN)
    ngo = UserFactory(role=Role.NGO, is_verified=False)

    resp = _client_for(admin).post(url("admin-user-reject", pk=ngo.id))
    assert resp.status_code == 200
    assert resp.data["is_verified"] is False
    assert resp.data["is_active"] is False


def test_search_by_name():
    admin = UserFactory(role=Role.ADMIN)
    UserFactory(full_name="Asha Citizen")
    UserFactory(full_name="Vikram Volunteer")

    resp = _client_for(admin).get(url("admin-user-list"), {"search": "Asha"})
    assert resp.status_code == 200
    assert resp.data["count"] == 1
    assert resp.data["results"][0]["full_name"] == "Asha Citizen"
