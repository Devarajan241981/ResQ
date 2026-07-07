import logging

from rest_framework.views import exception_handler

logger = logging.getLogger("resq")


class DomainError(Exception):
    """Base class for business-rule violations raised from the service layer."""

    default_message = "Something went wrong."
    status_code = 400

    def __init__(self, message: str | None = None):
        self.message = message or self.default_message
        super().__init__(self.message)


class DuplicateReportError(DomainError):
    default_message = "A similar report already exists."
    status_code = 409


class NotEligibleError(DomainError):
    default_message = "This action is not permitted for the current state."
    status_code = 403


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if isinstance(exc, DomainError):
        from rest_framework.response import Response

        return Response({"detail": exc.message, "code": exc.__class__.__name__}, status=exc.status_code)

    if response is not None:
        response.data = {"detail": response.data, "code": exc.__class__.__name__}
        return response

    logger.exception("Unhandled exception in %s", context.get("view"))
    return None
