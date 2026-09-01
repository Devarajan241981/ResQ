import base64
from unittest.mock import MagicMock, patch

import pytest
import requests
from django.urls import reverse
from rest_framework.test import APIClient

# The audit-log middleware writes to the DB on every request.
pytestmark = pytest.mark.django_db


def url():
    return reverse("tts:synthesize")


def test_returns_501_when_not_configured(settings):
    settings.SARVAM_API_KEY = ""
    resp = APIClient().post(url(), {"text": "hi", "language": "en"}, format="json")
    assert resp.status_code == 501


def test_synthesizes_audio(settings):
    settings.SARVAM_API_KEY = "test-key"
    audio = b"RIFF----WAVEfake-bytes"
    fake = MagicMock()
    fake.raise_for_status.return_value = None
    fake.json.return_value = {"audios": [base64.b64encode(audio).decode()]}

    with patch("apps.tts.services.requests.post", return_value=fake) as mock_post:
        resp = APIClient().post(url(), {"text": "Namaskar", "language": "te"}, format="json")

    assert resp.status_code == 200
    assert resp["Content-Type"] == "audio/wav"
    assert resp.content == audio
    # We map our UI language to Sarvam's code and send the configured speaker.
    sent = mock_post.call_args.kwargs["json"]
    assert sent["target_language_code"] == "te-IN"
    assert sent["speaker"] == settings.SARVAM_SPEAKER


def test_returns_502_on_provider_error(settings):
    settings.SARVAM_API_KEY = "test-key"
    with patch("apps.tts.services.requests.post", side_effect=requests.RequestException("boom")):
        resp = APIClient().post(url(), {"text": "hi", "language": "en"}, format="json")
    assert resp.status_code == 502


def test_returns_502_when_no_audio(settings):
    settings.SARVAM_API_KEY = "test-key"
    fake = MagicMock()
    fake.raise_for_status.return_value = None
    fake.json.return_value = {"audios": []}
    with patch("apps.tts.services.requests.post", return_value=fake):
        resp = APIClient().post(url(), {"text": "hi", "language": "en"}, format="json")
    assert resp.status_code == 502


def test_validates_missing_text(settings):
    settings.SARVAM_API_KEY = "test-key"
    resp = APIClient().post(url(), {"language": "en"}, format="json")
    assert resp.status_code == 400


def test_rejects_unknown_language(settings):
    settings.SARVAM_API_KEY = "test-key"
    resp = APIClient().post(url(), {"text": "hi", "language": "xx"}, format="json")
    assert resp.status_code == 400
