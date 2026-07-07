import math
import uuid

from django.db import models


class SoftDeleteQuerySet(models.QuerySet):
    def alive(self):
        return self.filter(is_deleted=False)

    def dead(self):
        return self.filter(is_deleted=True)


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).filter(is_deleted=False)


class BaseModel(models.Model):
    """Common fields for every domain model: UUID identity, timestamps, soft delete, audit stamps."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_by = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        editable=False,
        on_delete=models.SET_NULL,
        related_name="%(app_label)s_%(class)s_created",
    )
    updated_by = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        editable=False,
        on_delete=models.SET_NULL,
        related_name="%(app_label)s_%(class)s_updated",
    )

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        from apps.common.request_context import get_current_user

        user = get_current_user()
        if user is not None:
            if self._state.adding and not self.created_by_id:
                self.created_by = user
            self.updated_by = user
        super().save(*args, **kwargs)

    def soft_delete(self):
        from django.utils import timezone

        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=["is_deleted", "deleted_at", "updated_by"])


class GeoLocationMixin(models.Model):
    """Plain lat/lng fields with a bounding-box + haversine helper (no PostGIS/GDAL dependency)."""

    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        abstract = True

    @staticmethod
    def bounding_box(lat: float, lng: float, radius_km: float):
        """Return (lat_min, lat_max, lng_min, lng_max) for a cheap pre-filter before haversine."""
        lat_delta = radius_km / 111.0
        lng_delta = radius_km / (111.0 * max(0.1, abs(math.cos(math.radians(lat)))))
        return lat - lat_delta, lat + lat_delta, lng - lng_delta, lng + lng_delta


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(
        "accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="audit_logs"
    )
    action = models.CharField(max_length=100)
    request_id = models.CharField(max_length=64, blank=True)
    method = models.CharField(max_length=10, blank=True)
    path = models.CharField(max_length=255, blank=True)
    status_code = models.PositiveSmallIntegerField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["actor", "created_at"]),
            models.Index(fields=["action"]),
        ]

    def __str__(self):
        return f"{self.action} @ {self.created_at:%Y-%m-%d %H:%M:%S}"
