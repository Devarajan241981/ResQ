import datetime

import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.tests.factories import UserFactory
from apps.missing_children.models import MissingChildReport

pytestmark = pytest.mark.django_db


def _client(user):
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {RefreshToken.for_user(user).access_token}")
    return client


def list_url():
    return reverse("missing_children:missing-child-list")


def _payload(**overrides):
    payload = {
        "name": "Aarav",
        "age": 8,
        "gender": "male",
        "guardian_name": "Meera",
        "guardian_phone": "+919812345678",
        "last_seen_location": "MG Road, Bengaluru",
        "last_seen_at": datetime.datetime(2026, 7, 10, 9, 0, tzinfo=datetime.timezone.utc).isoformat(),
    }
    payload.update(overrides)
    return payload


def test_anyone_can_browse_the_feed():
    reporter = UserFactory()
    MissingChildReport.objects.create(reported_by=reporter, name="Aarav", age=8, gender="male",
                                      guardian_name="Meera", guardian_phone="+919812345678",
                                      last_seen_location="MG Road", last_seen_at="2026-07-10T09:00:00Z")
    resp = APIClient().get(list_url())
    assert resp.status_code == 200
    assert resp.data["count"] == 1


def test_feed_hides_guardian_phone():
    reporter = UserFactory()
    MissingChildReport.objects.create(reported_by=reporter, name="Aarav", age=8, gender="male",
                                      guardian_name="Meera", guardian_phone="+919812345678",
                                      last_seen_location="MG Road", last_seen_at="2026-07-10T09:00:00Z")
    resp = APIClient().get(list_url())
    assert "guardian_phone" not in resp.data["results"][0]


def test_create_requires_auth():
    resp = APIClient().post(list_url(), _payload(), format="json")
    assert resp.status_code in (401, 403)


def test_authenticated_user_can_report_a_child():
    user = UserFactory()
    resp = _client(user).post(list_url(), _payload(), format="json")
    assert resp.status_code == 201
    report = MissingChildReport.objects.get()
    assert report.reported_by == user
    assert report.status == "missing"
    assert report.name == "Aarav"
