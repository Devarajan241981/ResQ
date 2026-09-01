"""
Server-side proxy for Sarvam AI neural TTS (the "bulbul" model), which produces
natural, native-accent speech for Indian languages. Kept server-side so the
Sarvam subscription key never reaches the browser — the frontend calls our
endpoint, plays the returned audio, and falls back to the browser's built-in
Web Speech voices when this service is unconfigured or unavailable.

No business logic lives here — just a thin, swappable HTTP client. Provider,
model, speaker and pace are all configurable via settings/env so the voice can
be tuned without code changes.
"""
import base64
import binascii

import requests
from django.conf import settings

from apps.common.exceptions import DomainError

# Our UI language codes -> Sarvam target language codes (all 10 are supported).
SARVAM_LANGUAGES = {
    "en": "en-IN",
    "hi": "hi-IN",
    "ta": "ta-IN",
    "te": "te-IN",
    "kn": "kn-IN",
    "ml": "ml-IN",
    "mr": "mr-IN",
    "bn": "bn-IN",
    "gu": "gu-IN",
    "pa": "pa-IN",
}


class TtsProviderError(DomainError):
    default_message = "Voice service is temporarily unavailable."
    status_code = 502


class TtsNotConfiguredError(DomainError):
    default_message = "Voice service is not configured on this server."
    status_code = 501


def synthesize(text: str, language: str) -> bytes:
    """Return WAV audio bytes for `text` spoken in `language`.

    Raises TtsNotConfiguredError (501) when no API key is set, and
    TtsProviderError (502) when the upstream call fails or returns no audio.
    """
    if not settings.SARVAM_API_KEY:
        raise TtsNotConfiguredError()

    payload = {
        "text": text,
        "target_language_code": SARVAM_LANGUAGES.get(language, "en-IN"),
        "speaker": settings.SARVAM_SPEAKER,
        "pitch": 0,
        "pace": settings.SARVAM_PACE,
        "loudness": 1.0,
        "speech_sample_rate": 22050,
        "enable_preprocessing": True,
        "model": settings.SARVAM_MODEL,
    }

    try:
        resp = requests.post(
            f"{settings.SARVAM_BASE_URL}/text-to-speech",
            json=payload,
            headers={
                "api-subscription-key": settings.SARVAM_API_KEY,
                "Content-Type": "application/json",
            },
            timeout=15,
        )
        resp.raise_for_status()
        audios = resp.json().get("audios") or []
    except (requests.RequestException, ValueError) as exc:
        raise TtsProviderError() from exc

    if not audios:
        raise TtsProviderError()

    try:
        return base64.b64decode(audios[0])
    except (binascii.Error, ValueError) as exc:
        raise TtsProviderError() from exc
