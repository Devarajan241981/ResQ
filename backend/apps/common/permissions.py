from rest_framework.permissions import SAFE_METHODS, BasePermission


class HasRole(BasePermission):
    """Base class for role-gated views. Subclass and set `allowed_roles`."""

    allowed_roles: tuple[str, ...] = ()

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role in self.allowed_roles or request.user.is_superuser)
        )


class IsAdmin(HasRole):
    allowed_roles = ("admin", "super_admin")


class IsSuperAdmin(HasRole):
    allowed_roles = ("super_admin",)


class IsNGO(HasRole):
    allowed_roles = ("ngo", "admin", "super_admin")


class IsHospital(HasRole):
    allowed_roles = ("hospital", "admin", "super_admin")


class IsVolunteer(HasRole):
    allowed_roles = ("volunteer", "ngo", "admin", "super_admin")


class IsOwnerOrReadOnly(BasePermission):
    """Object-level permission: only the creator (`reported_by`/`user`) may write."""

    owner_field = "reported_by"

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        owner = getattr(obj, self.owner_field, None)
        return owner == request.user or request.user.is_superuser


class IsVerifiedReporter(BasePermission):
    """Blocks unverified accounts from creating high-trust reports (missing person, SOS)."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_verified)
