import datetime

import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import Role
from apps.accounts.tests.factories import UserFactory
from apps.events.models import Event, EventRSVP

pytestmark = pytest.mark.django_db


def _client_for(user) -> APIClient:
    # Independent clients only — the shared-fixture clients overwrite each other's creds.
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {RefreshToken.for_user(user).access_token}")
    return client


def list_url():
    return reverse("events:event-list")


def _payload(**overrides):
    payload = {
        "title": "Blood donation camp",
        "category": "blood_drive",
        "event_date": (datetime.date(2026, 8, 15)).isoformat(),
        "location": "Town Hall, Bengaluru",
        "city": "Bengaluru",
    }
    payload.update(overrides)
    return payload


def test_anyone_can_browse_events(api_client):
    ngo = UserFactory(role=Role.NGO, is_verified=True)
    Event.objects.create(created_by=ngo, title="Camp", event_date=datetime.date(2026, 8, 15))
    resp = api_client.get(list_url())
    assert resp.status_code == 200
    assert resp.data["count"] == 1


def test_month_filter(api_client):
    ngo = UserFactory(role=Role.NGO, is_verified=True)
    Event.objects.create(created_by=ngo, title="Aug", event_date=datetime.date(2026, 8, 10))
    Event.objects.create(created_by=ngo, title="Sep", event_date=datetime.date(2026, 9, 10))
    resp = api_client.get(list_url(), {"month": "2026-08"})
    assert resp.status_code == 200
    assert resp.data["count"] == 1
    assert resp.data["results"][0]["title"] == "Aug"


def test_verified_ngo_can_create_event():
    ngo = UserFactory(role=Role.NGO, is_verified=True)
    resp = _client_for(ngo).post(list_url(), _payload(), format="json")
    assert resp.status_code == 201
    assert resp.data["creator_name"] == ngo.full_name
    assert resp.data["rsvp_count"] == 0


def test_citizen_cannot_create_event():
    citizen = UserFactory(role=Role.CITIZEN, is_verified=True)
    resp = _client_for(citizen).post(list_url(), _payload(), format="json")
    assert resp.status_code == 403


def test_rsvp_adds_attendee_and_notifies_both_parties(django_capture_on_commit_callbacks):
    from apps.notifications.models import Notification

    ngo = UserFactory(role=Role.NGO, is_verified=True)
    citizen = UserFactory(role=Role.CITIZEN)
    event = Event.objects.create(created_by=ngo, title="Camp", event_date=datetime.date(2026, 8, 15))
    rsvp_url = reverse("events:event-rsvp", kwargs={"pk": event.id})

    with django_capture_on_commit_callbacks(execute=True):
        resp = _client_for(citizen).post(rsvp_url)

    assert resp.status_code == 200
    assert resp.data["rsvp_count"] == 1
    assert resp.data["has_rsvped"] is True
    assert EventRSVP.objects.filter(event=event, user=citizen).count() == 1
    # Attendee gets a confirmation; organizer gets an attendee alert.
    assert Notification.objects.filter(recipient=citizen, data__kind="event_rsvp").count() == 1
    assert Notification.objects.filter(recipient=ngo, data__kind="event_rsvp").count() == 1


def test_rsvp_is_idempotent_and_cancelable():
    ngo = UserFactory(role=Role.NGO, is_verified=True)
    citizen = UserFactory(role=Role.CITIZEN)
    event = Event.objects.create(created_by=ngo, title="Camp", event_date=datetime.date(2026, 8, 15))
    client = _client_for(citizen)
    rsvp_url = reverse("events:event-rsvp", kwargs={"pk": event.id})
    cancel_url = reverse("events:event-cancel-rsvp", kwargs={"pk": event.id})

    client.post(rsvp_url)
    client.post(rsvp_url)  # second RSVP must not double-count
    assert EventRSVP.objects.filter(event=event).count() == 1

    client.post(cancel_url)
    assert EventRSVP.objects.filter(event=event).count() == 0


def test_mine_lists_only_rsvped_events():
    ngo = UserFactory(role=Role.NGO, is_verified=True)
    citizen = UserFactory(role=Role.CITIZEN)
    e1 = Event.objects.create(created_by=ngo, title="Going", event_date=datetime.date(2026, 8, 15))
    Event.objects.create(created_by=ngo, title="Skipping", event_date=datetime.date(2026, 8, 16))
    client = _client_for(citizen)
    client.post(reverse("events:event-rsvp", kwargs={"pk": e1.id}))

    resp = client.get(reverse("events:event-mine"))
    assert resp.status_code == 200
    assert len(resp.data) == 1
    assert resp.data[0]["title"] == "Going"
