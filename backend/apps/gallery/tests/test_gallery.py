import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import Role
from apps.accounts.tests.factories import UserFactory
from apps.gallery.models import GalleryImage

pytestmark = pytest.mark.django_db

# 1x1 transparent GIF — smallest payload Pillow accepts as a real image.
TINY_GIF = (
    b"GIF87a\x01\x00\x01\x00\x80\x01\x00\x00\x00\x00ccc,\x00"
    b"\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"
)


def _client_for(user) -> APIClient:
    # NOTE: deliberately NOT using the auth_client/make_auth_client fixtures
    # together — they share one APIClient instance and silently overwrite
    # each other's credentials.
    client = APIClient()
    token = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


def _upload_payload(caption="Relief camp, day 2"):
    return {"image": SimpleUploadedFile("relief.gif", TINY_GIF, content_type="image/gif"), "caption": caption}


def list_url():
    return reverse("gallery:gallery-image-list")


def test_anyone_can_browse_the_gallery(api_client):
    ngo = UserFactory(role=Role.NGO, is_verified=True)
    GalleryImage.objects.create(uploaded_by=ngo, image=SimpleUploadedFile("x.gif", TINY_GIF), caption="Camp")

    resp = api_client.get(list_url())
    assert resp.status_code == 200
    assert resp.data["count"] == 1
    assert resp.data["results"][0]["caption"] == "Camp"


def test_verified_ngo_can_publish_an_image():
    ngo = UserFactory(role=Role.NGO, is_verified=True)
    resp = _client_for(ngo).post(list_url(), _upload_payload(), format="multipart")
    assert resp.status_code == 201
    assert resp.data["caption"] == "Relief camp, day 2"
    assert GalleryImage.objects.filter(uploaded_by=ngo).count() == 1


def test_citizen_cannot_publish():
    citizen = UserFactory(role=Role.CITIZEN, is_verified=True)
    resp = _client_for(citizen).post(list_url(), _upload_payload(), format="multipart")
    assert resp.status_code == 403


def test_unverified_ngo_cannot_publish():
    ngo = UserFactory(role=Role.NGO, is_verified=False)
    resp = _client_for(ngo).post(list_url(), _upload_payload(), format="multipart")
    assert resp.status_code == 403


def test_only_the_uploader_can_delete():
    ngo = UserFactory(role=Role.NGO, is_verified=True)
    other = UserFactory(role=Role.NGO, is_verified=True)
    image = GalleryImage.objects.create(uploaded_by=ngo, image=SimpleUploadedFile("x.gif", TINY_GIF))
    detail = reverse("gallery:gallery-image-detail", kwargs={"pk": image.id})

    assert _client_for(other).delete(detail).status_code == 403
    assert _client_for(ngo).delete(detail).status_code == 204
