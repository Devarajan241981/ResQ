import pytest
from django.urls import reverse
from django.utils import timezone

from apps.disaster_mode.models import AssignmentStatus, DisasterEvent

pytestmark = pytest.mark.django_db


def url(name, **kwargs):
    return reverse(f"disaster_mode:{name}", kwargs=kwargs or None)


def _make_event(admin_user):
    return DisasterEvent.objects.create(
        name="Bengaluru Flood",
        disaster_type="flood",
        affected_area="Koramangala",
        started_at=timezone.now(),
        created_by=admin_user,
    )


def test_only_admin_or_ngo_can_create_event(auth_client):
    resp = auth_client.post(
        url("disaster-event-list"),
        {"name": "Test Flood", "disaster_type": "flood", "started_at": timezone.now().isoformat()},
    )
    assert resp.status_code == 403


def test_admin_can_create_event(make_auth_client):
    from apps.accounts.models import Role
    from apps.accounts.tests.factories import UserFactory

    admin = UserFactory(role=Role.ADMIN, is_staff=True, is_superuser=True)
    client = make_auth_client(admin)

    resp = client.post(
        url("disaster-event-list"),
        {"name": "Test Flood", "disaster_type": "flood", "started_at": timezone.now().isoformat()},
    )
    assert resp.status_code == 201


def test_anyone_authenticated_can_submit_status_report(auth_client, user):
    event = _make_event(user)
    resp = auth_client.post(
        url("status-report-list"),
        {"event": str(event.id), "need_type": "need_water", "notes": "Out of drinking water"},
    )
    assert resp.status_code == 201
    assert resp.data["is_resolved"] is False


def test_resolve_status_report(auth_client, user):
    event = _make_event(user)
    created = auth_client.post(
        url("status-report-list"), {"event": str(event.id), "need_type": "need_food"}
    )
    resp = auth_client.post(url("status-report-resolve", pk=created.data["id"]))
    assert resp.status_code == 200
    assert resp.data["is_resolved"] is True


def test_open_needs_count_excludes_safe_and_resolved(auth_client, user):
    event = _make_event(user)
    auth_client.post(url("status-report-list"), {"event": str(event.id), "need_type": "need_rescue"})
    auth_client.post(url("status-report-list"), {"event": str(event.id), "need_type": "safe"})

    resp = auth_client.get(url("disaster-event-detail", pk=event.id))
    assert resp.status_code == 200
    assert resp.data["open_needs_count"] == 1


def test_volunteer_assignment_complete(auth_client, user):
    from apps.disaster_mode.models import VolunteerAssignment

    event = _make_event(user)
    assignment = VolunteerAssignment.objects.create(event=event, volunteer=user)

    resp = auth_client.post(url("volunteer-assignment-complete", pk=assignment.id))
    assert resp.status_code == 200
    assert resp.data["status"] == AssignmentStatus.COMPLETED
