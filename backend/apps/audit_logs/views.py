from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, viewsets

from apps.audit_logs import selectors
from apps.audit_logs.serializers import AuditLogSerializer
from apps.common.permissions import IsAdmin


class AuditLogViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["actor", "method", "status_code"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            from apps.audit_logs.models import AuditLog

            return AuditLog.objects.none()
        return selectors.get_recent_logs()
