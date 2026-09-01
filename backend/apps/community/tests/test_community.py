import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import Role
from apps.accounts.tests.factories import UserFactory
from apps.community.models import Community

pytestmark = pytest.mark.django_db


def url(name, **kwargs):
    return reverse(f"community:{name}", kwargs=kwargs or None)


def _client_for(user):
    client = APIClient()
    token = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


def _make_ngo(is_verified=True):
    return UserFactory(role=Role.NGO, is_verified=is_verified)


def _make_community(owner, **overrides):
    defaults = dict(owner=owner, name="Flood Relief Updates", city="Chennai")
    defaults.update(overrides)
    return Community.objects.create(**defaults)


def test_citizen_cannot_create_community():
    citizen = UserFactory()
    resp = _client_for(citizen).post(url("community-list"), {"name": "My Channel", "city": "Chennai"})
    assert resp.status_code == 403


def test_unverified_ngo_cannot_create_community():
    ngo = _make_ngo(is_verified=False)
    resp = _client_for(ngo).post(url("community-list"), {"name": "My Channel", "city": "Chennai"})
    assert resp.status_code == 403


def test_verified_ngo_can_create_community():
    ngo = _make_ngo()
    resp = _client_for(ngo).post(url("community-list"), {"name": "Flood Relief Updates", "city": "Chennai"})
    assert resp.status_code == 201
    assert resp.data["owner_name"] == ngo.full_name
    assert resp.data["member_count"] == 0


def test_community_list_is_public():
    ngo = _make_ngo()
    _make_community(ngo)
    resp = APIClient().get(url("community-list"))
    assert resp.status_code == 200
    assert resp.data["count"] == 1


def test_any_authenticated_user_can_join_and_leave():
    ngo = _make_ngo()
    community = _make_community(ngo)
    citizen = UserFactory()
    client = _client_for(citizen)

    join_resp = client.post(url("community-join", pk=community.id))
    assert join_resp.status_code == 200
    assert join_resp.data["member_count"] == 1
    assert join_resp.data["is_member"] is True

    leave_resp = client.post(url("community-leave", pk=community.id))
    assert leave_resp.status_code == 200
    assert leave_resp.data["member_count"] == 0
    assert leave_resp.data["is_member"] is False


def test_joining_twice_does_not_duplicate_membership():
    ngo = _make_ngo()
    community = _make_community(ngo)
    citizen = UserFactory()
    client = _client_for(citizen)

    client.post(url("community-join", pk=community.id))
    resp = client.post(url("community-join", pk=community.id))
    assert resp.data["member_count"] == 1


def test_only_owner_can_post():
    ngo = _make_ngo()
    community = _make_community(ngo)
    other_ngo = _make_ngo()

    resp = _client_for(other_ngo).post(
        url("community-post-list"), {"community": str(community.id), "content": "Hello"}
    )
    assert resp.status_code == 403
    assert resp.data["code"] == "NotEligibleError"


def test_owner_can_post_and_it_is_publicly_visible():
    ngo = _make_ngo()
    community = _make_community(ngo)

    created = _client_for(ngo).post(
        url("community-post-list"), {"community": str(community.id), "content": "Relief camp open at 6pm."}
    )
    assert created.status_code == 201

    resp = APIClient().get(url("community-post-list"), {"community": str(community.id)})
    assert resp.status_code == 200
    assert resp.data["count"] == 1
    assert resp.data["results"][0]["content"] == "Relief camp open at 6pm."


def test_authenticated_user_can_like_and_unlike_a_post():
    ngo = _make_ngo()
    community = _make_community(ngo)
    created = _client_for(ngo).post(
        url("community-post-list"), {"community": str(community.id), "content": "Update"}
    )
    post_id = created.data["id"]

    citizen = UserFactory()
    client = _client_for(citizen)

    like_resp = client.post(url("community-post-like", pk=post_id))
    assert like_resp.status_code == 200
    assert like_resp.data["like_count"] == 1
    assert like_resp.data["has_liked"] is True

    unlike_resp = client.post(url("community-post-unlike", pk=post_id))
    assert unlike_resp.status_code == 200
    assert unlike_resp.data["like_count"] == 0
    assert unlike_resp.data["has_liked"] is False


def test_liking_twice_does_not_duplicate():
    ngo = _make_ngo()
    community = _make_community(ngo)
    created = _client_for(ngo).post(
        url("community-post-list"), {"community": str(community.id), "content": "Update"}
    )
    post_id = created.data["id"]
    client = _client_for(UserFactory())

    client.post(url("community-post-like", pk=post_id))
    resp = client.post(url("community-post-like", pk=post_id))
    assert resp.data["like_count"] == 1
