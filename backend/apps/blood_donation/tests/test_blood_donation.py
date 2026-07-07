import pytest
from django.urls import reverse

from apps.blood_donation.models import BloodRequestStatus

pytestmark = pytest.mark.django_db


def url(name, **kwargs):
    return reverse(f"blood_donation:{name}", kwargs=kwargs or None)


def test_create_donor_profile_scoped_to_owner(auth_client, user):
    resp = auth_client.post(
        url("donor-list"), {"blood_group": "O+", "city": "Bengaluru", "is_available": True}
    )
    assert resp.status_code == 201
    assert resp.data["user"] == user.id


def test_create_blood_request_and_respond(auth_client, make_auth_client):
    from apps.accounts.tests.factories import UserFactory

    created = auth_client.post(
        url("blood-request-list"),
        {"patient_name": "John", "blood_group": "O+", "units_needed": 2, "city": "Bengaluru", "urgency": "critical"},
    )
    assert created.status_code == 201
    request_id = created.data["id"]

    donor_client = make_auth_client(UserFactory())
    resp = donor_client.post(url("blood-request-respond", pk=request_id))
    assert resp.status_code == 200
    assert resp.data["status"] == "offered"


def test_fulfill_and_cancel_blood_request(auth_client):
    created = auth_client.post(
        url("blood-request-list"),
        {"patient_name": "Jane", "blood_group": "A+", "units_needed": 1, "city": "Mumbai"},
    )
    request_id = created.data["id"]

    resp = auth_client.post(url("blood-request-fulfill", pk=request_id))
    assert resp.status_code == 200
    assert resp.data["status"] == BloodRequestStatus.FULFILLED


def test_nearby_donors_filters_by_radius(auth_client, user):
    from apps.blood_donation.models import DonorProfile

    DonorProfile.objects.create(user=user, blood_group="B+", city="Bengaluru", latitude="12.9716", longitude="77.5946")

    resp = auth_client.get(url("donor-nearby"), {"lat": "12.9716", "lng": "77.5946", "radius_km": "5"})
    assert resp.status_code == 200
    assert len(resp.data) == 1

    resp_far = auth_client.get(url("donor-nearby"), {"lat": "28.6139", "lng": "77.2090", "radius_km": "5"})
    assert len(resp_far.data) == 0
