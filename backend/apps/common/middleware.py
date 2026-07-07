import logging
import uuid

from apps.common.request_context import clear_current_request, set_current_request

logger = logging.getLogger("resq")

AUDITED_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


class CurrentUserMiddleware:
    """Stashes the in-flight request in a thread-local so BaseModel.save() can auto-stamp created_by/updated_by."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        set_current_request(request)
        try:
            return self.get_response(request)
        finally:
            clear_current_request()


class RequestIDMiddleware:
    """Stamps every request with an X-Request-ID for log correlation and tracing."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        response = self.get_response(request)
        response["X-Request-ID"] = request.request_id
        return response


class AuditLogMiddleware:
    """Persists a lightweight audit trail for state-changing requests under /api/."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.method in AUDITED_METHODS and request.path.startswith("/api/"):
            self._record(request, response)
        return response

    @staticmethod
    def _record(request, response):
        from apps.common.models import AuditLog

        user = getattr(request, "user", None)
        try:
            AuditLog.objects.create(
                actor=user if user and user.is_authenticated else None,
                action=f"{request.method} {request.path}",
                request_id=getattr(request, "request_id", ""),
                method=request.method,
                path=request.path,
                status_code=response.status_code,
                ip_address=request.META.get("REMOTE_ADDR"),
            )
        except Exception:
            logger.exception("Failed to write audit log entry")
