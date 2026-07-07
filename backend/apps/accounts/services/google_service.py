from django.conf import settings
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from apps.common.exceptions import DomainError


class InvalidGoogleTokenError(DomainError):
    default_message = "Invalid Google sign-in token."
    status_code = 400


def verify_google_id_token(token: str) -> dict:
    if not settings.GOOGLE_OAUTH_CLIENT_ID:
        raise InvalidGoogleTokenError("Google sign-in is not configured on this server.")
    try:
        payload = id_token.verify_oauth2_token(
            token, google_requests.Request(), settings.GOOGLE_OAUTH_CLIENT_ID
        )
    except ValueError as exc:
        raise InvalidGoogleTokenError() from exc

    return {
        "sub": payload["sub"],
        "email": payload.get("email"),
        "full_name": payload.get("name", ""),
        "email_verified": payload.get("email_verified", False),
    }
