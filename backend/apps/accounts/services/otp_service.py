import hashlib
import random
import string

from django.conf import settings
from django.utils import timezone

from apps.accounts.models import OTPPurpose, OTPRequest
from apps.common.exceptions import DomainError
from apps.common.sms import send_sms


class OTPInvalidError(DomainError):
    default_message = "Invalid or expired OTP."
    status_code = 400


class OTPRateLimitedError(DomainError):
    default_message = "Too many OTP attempts. Try again later."
    status_code = 429


def _hash_code(phone: str, code: str) -> str:
    return hashlib.sha256(f"{phone}:{code}:{settings.SECRET_KEY}".encode()).hexdigest()


def generate_and_send_otp(phone: str, purpose: str = OTPPurpose.LOGIN) -> OTPRequest:
    code = "".join(random.choices(string.digits, k=settings.OTP_LENGTH))
    expires_at = timezone.now() + timezone.timedelta(seconds=settings.OTP_EXPIRY_SECONDS)

    otp = OTPRequest.objects.create(
        phone=phone,
        code_hash=_hash_code(str(phone), code),
        purpose=purpose,
        expires_at=expires_at,
    )
    send_sms(str(phone), f"Your ResQ India verification code is {code}")
    return otp


def verify_otp(phone: str, code: str, purpose: str = OTPPurpose.LOGIN) -> OTPRequest:
    otp = (
        OTPRequest.objects.filter(phone=phone, purpose=purpose, is_used=False)
        .order_by("-created_at")
        .first()
    )
    if otp is None:
        raise OTPInvalidError()

    if otp.attempts >= 5:
        raise OTPRateLimitedError()

    if otp.is_expired():
        raise OTPInvalidError("OTP has expired, request a new one.")

    if otp.code_hash != _hash_code(str(phone), code):
        otp.attempts += 1
        otp.save(update_fields=["attempts"])
        raise OTPInvalidError()

    otp.is_used = True
    otp.save(update_fields=["is_used"])
    return otp
