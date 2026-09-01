from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.throttling import ScopedRateThrottle

from apps.common.permissions import IsOwnerOrReadOnly
from apps.missing_elderly.models import MissingElderlyReport
from apps.missing_elderly.serializers import (
    MissingElderlyReportSerializer,
    PublicMissingElderlySerializer,
)


class MissingElderlyReportViewSet(viewsets.ModelViewSet):
    serializer_class = MissingElderlyReportSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status", "gender"]
    throttle_scope = "report-create"

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return MissingElderlyReport.objects.none()
        return MissingElderlyReport.objects.all().order_by("-created_at")

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]

    def get_serializer_class(self):
        if self.action == "list":
            return PublicMissingElderlySerializer
        return super().get_serializer_class()

    def get_throttles(self):
        if self.action == "create":
            return [ScopedRateThrottle()]
        return super().get_throttles()

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)
