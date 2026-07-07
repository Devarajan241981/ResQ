import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.tests.factories import UserFactory


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return UserFactory()


@pytest.fixture
def unverified_user(db):
    return UserFactory(is_verified=False)


def _authenticate(client, user):
    token = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


@pytest.fixture
def auth_client(api_client, user):
    return _authenticate(api_client, user)


@pytest.fixture
def make_auth_client(api_client):
    def _make(for_user):
        return _authenticate(api_client, for_user)

    return _make
