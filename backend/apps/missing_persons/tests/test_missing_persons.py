from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone

from apps.missing_persons.models import MissingPersonReport, MissingPersonStatus

pytestmark = pytest.mark.django_db


def url(name, **kwargs):
    return reverse(f"missing_persons:{name}", kwargs=kwargs or None)


def _report_payload(**overrides):
    payload = {
        "name": "Jane Doe",
        "age": 30,
        "gender": "female",
        "last_seen_location": "MG Road, Bengaluru",
        "last_seen_at": (timezone.now() - timedelta(days=1)).isoformat(),
    }
    payload.update(overrides)
    return payload


def test_create_report_requires_verified_reporter(make_auth_client, unverified_user):
    client = make_auth_client(unverified_user)
    resp = client.post(url("missing-person-list"), _report_payload(), format="multipart")
    assert resp.status_code == 403


def test_create_report_generates_qr_and_risk_score(auth_client):
    resp = auth_client.post(url("missing-person-list"), _report_payload(), format="multipart")
    assert resp.status_code == 201
    assert resp.data["qr_code"]
    assert resp.data["public_slug"]
    # no photos, no contacts, no clothing_description -> 3 + 2 + 1 = 6
    assert resp.data["risk_score"] == "6.00"


def test_last_seen_at_in_future_is_rejected(auth_client):
    future = (timezone.now() + timedelta(days=1)).isoformat()
    resp = auth_client.post(url("missing-person-list"), _report_payload(last_seen_at=future), format="multipart")
    assert resp.status_code == 400


def test_public_detail_view_is_unauthenticated(api_client, auth_client):
    created = auth_client.post(url("missing-person-list"), _report_payload(), format="multipart")
    slug = created.data["public_slug"]

    resp = api_client.get(url("public-detail", slug=slug))
    assert resp.status_code == 200
    assert resp.data["name"] == "Jane Doe"
    assert "emergency_contacts" not in resp.data


def test_update_status_by_owner_succeeds(auth_client):
    created = auth_client.post(url("missing-person-list"), _report_payload(), format="multipart")
    report_id = created.data["id"]

    resp = auth_client.patch(
        url("missing-person-update-status", pk=report_id),
        {"status": MissingPersonStatus.FOUND},
        format="multipart",
    )
    assert resp.status_code == 200
    assert resp.data["status"] == MissingPersonStatus.FOUND


def test_update_status_by_non_owner_forbidden(auth_client, make_auth_client, user):
    from apps.accounts.tests.factories import UserFactory

    created = auth_client.post(url("missing-person-list"), _report_payload(), format="multipart")
    other_client = make_auth_client(UserFactory())

    resp = other_client.patch(
        url("missing-person-update-status", pk=created.data["id"]),
        {"status": MissingPersonStatus.FOUND},
        format="multipart",
    )
    assert resp.status_code == 403


def test_duplicates_endpoint_finds_same_name_and_age(auth_client):
    first = auth_client.post(url("missing-person-list"), _report_payload(), format="multipart")
    auth_client.post(url("missing-person-list"), _report_payload(), format="multipart")

    resp = auth_client.get(url("missing-person-duplicates", pk=first.data["id"]))
    assert resp.status_code == 200
    assert len(resp.data) == 1


def test_add_sighting(auth_client):
    created = auth_client.post(url("missing-person-list"), _report_payload(), format="multipart")
    resp = auth_client.post(
        url("missing-person-add-sighting", pk=created.data["id"]),
        {
            "description": "Saw someone matching the description",
            "sighted_at": timezone.now().isoformat(),
        },
        format="multipart",
    )
    assert resp.status_code == 201
    assert MissingPersonReport.objects.get(id=created.data["id"]).sightings.count() == 1
