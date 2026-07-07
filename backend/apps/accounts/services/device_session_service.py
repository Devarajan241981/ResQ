from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import DeviceSession
from apps.common.exceptions import DomainError


class SessionNotFoundError(DomainError):
    default_message = "Session not found."
    status_code = 404


def issue_tokens(user, request=None) -> dict:
    """Issues an access/refresh pair and records a DeviceSession row for the refresh token's jti."""
    refresh = RefreshToken.for_user(user)

    device_id = ""
    device_name = ""
    user_agent = ""
    ip_address = None
    if request is not None:
        device_id = request.headers.get("X-Device-ID", "")
        device_name = request.headers.get("X-Device-Name", "")
        user_agent = request.META.get("HTTP_USER_AGENT", "")[:255]
        ip_address = request.META.get("REMOTE_ADDR")

    DeviceSession.objects.create(
        user=user,
        refresh_jti=refresh["jti"],
        device_id=device_id,
        device_name=device_name,
        user_agent=user_agent,
        ip_address=ip_address,
    )

    return {"access": str(refresh.access_token), "refresh": str(refresh)}


def revoke_session(user, session_id) -> None:
    try:
        session = DeviceSession.objects.get(id=session_id, user=user, is_active=True)
    except DeviceSession.DoesNotExist as exc:
        raise SessionNotFoundError() from exc

    outstanding = OutstandingToken.objects.filter(jti=session.refresh_jti).first()
    if outstanding is not None:
        BlacklistedToken.objects.get_or_create(token=outstanding)

    from django.utils import timezone

    session.is_active = False
    session.revoked_at = timezone.now()
    session.save(update_fields=["is_active", "revoked_at"])
