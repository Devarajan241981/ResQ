import pytest
from django.urls import reverse

from apps.sos.models import SOSAlert, SOSStatus, TrustedContact

pytestmark = pytest.mark.django_db


def url(name, **kwargs):
    return reverse(f"sos:{name}", kwargs=kwargs or None)


def test_create_trusted_contact_scoped_to_owner(auth_client, user):
    resp = auth_client.post(
        url("trusted-contact-list"), {"name": "Mom", "phone": "+919876000010", "relationship": "mother"}
    )
    assert resp.status_code == 201
    assert TrustedContact.objects.get(id=resp.data["id"]).user == user


def test_trusted_contacts_are_not_visible_to_other_users(auth_client, make_auth_client):
    from apps.accounts.tests.factories import UserFactory

    auth_client.post(url("trusted-contact-list"), {"name": "Mom", "phone": "+919876000011"})

    other_client = make_auth_client(UserFactory())
    resp = other_client.get(url("trusted-contact-list"))
    assert resp.status_code == 200
    assert resp.data["count"] == 0


def test_create_sos_alert_notifies_trusted_contacts(auth_client, user):
    TrustedContact.objects.create(user=user, name="Dad", phone="+919876000012")

    resp = auth_client.post(
        url("sos-alert-list"), {"notes": "Need help", "latitude": "12.9716", "longitude": "77.5946"}
    )
    assert resp.status_code == 201
    assert resp.data["status"] == SOSStatus.ACTIVE


def test_resolve_and_cancel_alert(auth_client):
    created = auth_client.post(url("sos-alert-list"), {"notes": "test"})
    alert_id = created.data["id"]

    resp = auth_client.post(url("sos-alert-resolve", pk=alert_id))
    assert resp.status_code == 200
    assert resp.data["status"] == SOSStatus.RESOLVED


def test_ping_location_updates_alert_and_creates_ping(auth_client):
    created = auth_client.post(url("sos-alert-list"), {"notes": "test"})
    alert_id = created.data["id"]

    resp = auth_client.post(
        url("sos-alert-ping-location", pk=alert_id), {"latitude": "13.0", "longitude": "77.6"}
    )
    assert resp.status_code == 200

    alert = SOSAlert.objects.get(id=alert_id)
    assert alert.pings.count() == 1
    assert str(alert.latitude) == "13.000000"


def test_sos_alerts_are_scoped_to_owner(auth_client, make_auth_client):
    from apps.accounts.tests.factories import UserFactory

    auth_client.post(url("sos-alert-list"), {"notes": "mine"})

    other_client = make_auth_client(UserFactory())
    resp = other_client.get(url("sos-alert-list"))
    assert resp.status_code == 200
    assert resp.data["count"] == 0
