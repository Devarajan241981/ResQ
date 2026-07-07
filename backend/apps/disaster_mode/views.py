from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.permissions import IsAdmin, IsNGO
from apps.disaster_mode.models import AssignmentStatus, DisasterEvent, StatusReport, VolunteerAssignment
from apps.disaster_mode.serializers import (
    DisasterEventSerializer,
    StatusReportSerializer,
    VolunteerAssignmentSerializer,
)


class DisasterEventViewSet(viewsets.ModelViewSet):
    serializer_class = DisasterEventSerializer
    queryset = DisasterEvent.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["disaster_type", "status"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), (IsAdmin | IsNGO)()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class StatusReportViewSet(viewsets.ModelViewSet):
    serializer_class = StatusReportSerializer
    queryset = StatusReport.objects.select_related("user", "event")
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["event", "need_type", "is_resolved"]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        report = serializer.save(user=self.request.user)

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"disaster_{report.event_id}",
            {"type": "status_report_created", "payload": self.get_serializer(report).data},
        )

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        report = self.get_object()
        report.is_resolved = True
        report.save(update_fields=["is_resolved"])
        return Response(self.get_serializer(report).data)


class VolunteerAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = VolunteerAssignmentSerializer
    queryset = VolunteerAssignment.objects.select_related("volunteer", "event")
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["event", "volunteer", "status"]

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=["post"], url_path="complete")
    def complete(self, request, pk=None):
        from django.utils import timezone

        assignment = self.get_object()
        assignment.status = AssignmentStatus.COMPLETED
        assignment.completed_at = timezone.now()
        assignment.save(update_fields=["status", "completed_at"])
        return Response(self.get_serializer(assignment).data)
