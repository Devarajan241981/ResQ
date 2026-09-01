import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import OTPPurpose, OTPRequest
from apps.accounts.services.otp_service import _hash_code
from apps.accounts.tests.factories import UserFactory

pytestmark = pytest.mark.django_db

PHONE = "+919812345678"
CODE = "123456"


def _client(user):
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {RefreshToken.for_user(user).access_token}")
    return client


def _seed_otp(phone=PHONE, code=CODE):
    return OTPRequest.objects.create(
        phone=phone,
        code_hash=_hash_code(phone, code),
        purpose=OTPPurpose.PHONE_VERIFICATION,
        expires_at=timezone.now() + timezone.timedelta(minutes=5),
    )


def test_request_requires_auth():
    resp = APIClient().post(reverse("accounts:phone-verify-request"), {"phone": PHONE}, format="json")
    assert resp.status_code in (401, 403)


def test_request_sends_otp():
    user = UserFactory(is_verified=False)
    resp = _client(user).post(reverse("accounts:phone-verify-request"), {"phone": PHONE}, format="json")
    assert resp.status_code == 200
    assert OTPRequest.objects.filter(phone=PHONE, purpose=OTPPurpose.PHONE_VERIFICATION).exists()


def test_verify_marks_account_verified():
    user = UserFactory(is_verified=False, phone=None)
    _seed_otp()
    resp = _client(user).post(
        reverse("accounts:phone-verify-confirm"), {"phone": PHONE, "code": CODE}, format="json"
    )
    assert resp.status_code == 200
    user.refresh_from_db()
    assert user.is_verified is True
    assert user.phone == PHONE


def test_verify_rejects_wrong_code():
    user = UserFactory(is_verified=False)
    _seed_otp()
    resp = _client(user).post(
        reverse("accounts:phone-verify-confirm"), {"phone": PHONE, "code": "000000"}, format="json"
    )
    assert resp.status_code == 400
    user.refresh_from_db()
    assert user.is_verified is False


def test_phone_taken_by_another_user_conflicts():
    UserFactory(phone=PHONE)  # someone else already owns this number
    user = UserFactory(is_verified=False)
    resp = _client(user).post(reverse("accounts:phone-verify-request"), {"phone": PHONE}, format="json")
    assert resp.status_code == 409
