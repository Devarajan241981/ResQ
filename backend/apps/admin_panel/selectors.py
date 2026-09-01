"""Read-only queries for the admin panel. No mutation happens here — see views for the write path."""
from apps.accounts.models import Role


def get_pending_ngo_verifications():
    from apps.accounts.models import User

    return User.objects.filter(role=Role.NGO, is_verified=False).select_related("ngo_profile")
