import logging

from django.conf import settings

logger = logging.getLogger("resq")


def send_sms(phone: str, message: str) -> None:
    """Pluggable SMS gateway. Swap the branch below for MSG91 / Twilio / AWS SNS in production."""
    if settings.SMS_PROVIDER == "console":
        logger.info("[SMS-CONSOLE] to %s: %s", phone, message)
        return
    raise NotImplementedError(f"SMS provider '{settings.SMS_PROVIDER}' is not configured.")
