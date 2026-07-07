import re
from unittest.mock import patch

import pytest
from django.urls import reverse

from apps.accounts.models import DeviceSession, User

pytestmark = pytest.mark.django_db


def test_register_creates_user_and_returns_tokens(api_client):
    url = reverse("accounts:register")
    resp = api_client.post(
        url,
        {
            "full_name": "New Citizen",
            "email": "new@example.com",
            "phone": "+919876000001",
            "password": "StrongPass123!",
        },
    )
    assert resp.status_code == 201
    assert "access" in resp.data and "refresh" in resp.data
    assert User.objects.filter(email="new@example.com").exists()


def test_register_with_gender_and_blood_group_creates_donor_profile(api_client):
    from apps.blood_donation.models import DonorProfile

    resp = api_client.post(
        reverse("accounts:register"),
        {
            "full_name": "Donor Citizen",
            "email": "donor@example.com",
            "phone": "+919876000009",
            "password": "StrongPass123!",
            "gender": "female",
            "city": "Bengaluru",
            "blood_group": "O+",
        },
    )
    assert resp.status_code == 201
    user = User.objects.get(email="donor@example.com")
    assert user.gender == "female"
    assert user.city == "Bengaluru"

    donor = DonorProfile.objects.get(user=user)
    assert donor.blood_group == "O+"
    assert donor.city == "Bengaluru"
    assert donor.is_available is True


def test_register_without_blood_group_does_not_create_donor_profile(api_client):
    from apps.blood_donation.models import DonorProfile

    resp = api_client.post(
        reverse("accounts:register"),
        {
            "full_name": "No Donor",
            "email": "nodonor@example.com",
            "phone": "+919876000008",
            "password": "StrongPass123!",
        },
    )
    assert resp.status_code == 201
    user = User.objects.get(email="nodonor@example.com")
    assert not DonorProfile.objects.filter(user=user).exists()


def test_register_rejects_privileged_role(api_client):
    url = reverse("accounts:register")
    resp = api_client.post(
        url,
        {
            "full_name": "Sneaky Admin",
            "email": "sneaky@example.com",
            "phone": "+919876000002",
            "password": "StrongPass123!",
            "role": "admin",
        },
    )
    assert resp.status_code == 400


def test_login_with_correct_credentials_succeeds(api_client, user):
    url = reverse("accounts:login")
    resp = api_client.post(url, {"email": user.email, "password": "StrongPass123!"})
    assert resp.status_code == 200
    assert "access" in resp.data


def test_login_with_wrong_password_fails(api_client, user):
    url = reverse("accounts:login")
    resp = api_client.post(url, {"email": user.email, "password": "WrongPassword!"})
    assert resp.status_code == 401


def test_otp_request_then_verify_issues_tokens(api_client):
    phone = "+919876000003"
    with patch("apps.accounts.services.otp_service.send_sms") as mock_send:
        resp = api_client.post(reverse("accounts:otp-request"), {"phone": phone})
        assert resp.status_code == 200

    message = mock_send.call_args[0][1]
    code = re.search(r"\d{6}", message).group()

    resp = api_client.post(reverse("accounts:otp-verify"), {"phone": phone, "code": code, "full_name": "OTP User"})
    assert resp.status_code == 201
    assert "access" in resp.data
    assert User.objects.get(phone=phone).is_verified is True


def test_otp_verify_with_wrong_code_fails(api_client):
    phone = "+919876000004"
    with patch("apps.accounts.services.otp_service.send_sms"):
        api_client.post(reverse("accounts:otp-request"), {"phone": phone})

    resp = api_client.post(reverse("accounts:otp-verify"), {"phone": phone, "code": "000000"})
    assert resp.status_code == 400


def test_me_endpoint_requires_authentication(api_client):
    resp = api_client.get(reverse("accounts:me"))
    assert resp.status_code == 401


def test_me_endpoint_returns_current_user(auth_client, user):
    resp = auth_client.get(reverse("accounts:me"))
    assert resp.status_code == 200
    assert resp.data["email"] == user.email


def test_register_creates_device_session(api_client):
    api_client.post(
        reverse("accounts:register"),
        {
            "full_name": "Session User",
            "email": "sessionuser@example.com",
            "phone": "+919876000005",
            "password": "StrongPass123!",
        },
    )
    user = User.objects.get(email="sessionuser@example.com")
    assert DeviceSession.objects.filter(user=user, is_active=True).count() == 1


def test_sessions_list_and_revoke(auth_client, user):
    session = DeviceSession.objects.create(user=user, refresh_jti="test-jti-123")

    resp = auth_client.get(reverse("accounts:sessions"))
    assert resp.status_code == 200
    assert resp.data["count"] == 1

    resp = auth_client.post(reverse("accounts:session-revoke", args=[session.id]))
    assert resp.status_code == 200
    session.refresh_from_db()
    assert session.is_active is False
