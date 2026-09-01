from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.throttling import ScopedRateThrottle

from apps.common.permissions import IsOwnerOrReadOnly
from apps.missing_children.models import MissingChildReport
from apps.missing_children.serializers import (
    MissingChildReportSerializer,
    PublicMissingChildSerializer,
)


class MissingChildReportViewSet(viewsets.ModelViewSet):
    """Child-safety reports. The feed (list) is a public, PII-safe surface;
    creating a report requires an account. Mirrors the missing_persons flow with
    the extra fields (guardian, school hook) this workflow needs."""

    serializer_class = MissingChildReportSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status", "gender"]
    throttle_scope = "report-create"

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return MissingChildReport.objects.none()
        return MissingChildReport.objects.all().order_by("-created_at")

    def get_permissions(self):
        if self.action == "list" or self.action == "retrieve":
            return [permissions.AllowAny()]
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]

    def get_serializer_class(self):
        if self.action == "list":
            return PublicMissingChildSerializer
        return super().get_serializer_class()

    def get_throttles(self):
        if self.action == "create":
            return [ScopedRateThrottle()]
        return super().get_throttles()

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)
