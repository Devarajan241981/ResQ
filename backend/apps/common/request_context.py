"""
Thread-local holder for the current request, so BaseModel.save() can auto-stamp
created_by/updated_by without every call site having to pass a user through explicitly.
Standard "current user" middleware pattern (same idea as django-crum).
"""
import threading

_thread_locals = threading.local()


def set_current_request(request) -> None:
    _thread_locals.request = request


def clear_current_request() -> None:
    if hasattr(_thread_locals, "request"):
        del _thread_locals.request


def get_current_user():
    """
    Returns the authenticated user for the in-flight request, or None.
    Reads request.user lazily: for DRF views this resolves correctly because
    JWTAuthentication replaces request.user during view dispatch, which happens
    after this middleware ran but before any model .save() call in the view.
    """
    request = getattr(_thread_locals, "request", None)
    if request is None:
        return None
    user = getattr(request, "user", None)
    if user is None or not getattr(user, "is_authenticated", False):
        return None
    return user
