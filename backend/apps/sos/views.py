from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from apps.sos import selectors, services
from apps.sos.models import SOSAlert, SOSStatus, TrustedContact
from apps.sos.serializers import SOSAlertSerializer, SOSLocationPingSerializer, TrustedContactSerializer


class TrustedContactViewSet(viewsets.ModelViewSet):
    serializer_class = TrustedContactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return TrustedContact.objects.none()
        return selectors.get_trusted_contacts_for(self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SOSAlertViewSet(viewsets.ModelViewSet):
    serializer_class = SOSAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "sos"

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return SOSAlert.objects.none()
        return selectors.get_alerts_for(self.request.user)

    def perform_create(self, serializer):
        alert = serializer.save(user=self.request.user)
        services.trigger_sos(alert)

    @action(detail=True, methods=["post"], url_path="ping")
    def ping_location(self, request, pk=None):
        alert = self.get_object()
        serializer = SOSLocationPingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ping = serializer.save(alert=alert)

        alert.latitude = ping.latitude
        alert.longitude = ping.longitude
        alert.save(update_fields=["latitude", "longitude"])

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"sos_{alert.id}",
            {"type": "location.update", "payload": SOSLocationPingSerializer(ping).data},
        )
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="resolve")
    def resolve(self, request, pk=None):
        alert = self.get_object()
        alert.status = SOSStatus.RESOLVED
        alert.resolved_at = timezone.now()
        alert.save(update_fields=["status", "resolved_at"])
        return Response(self.get_serializer(alert).data)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        alert = self.get_object()
        alert.status = SOSStatus.CANCELLED
        alert.resolved_at = timezone.now()
        alert.save(update_fields=["status", "resolved_at"])
        return Response(self.get_serializer(alert).data)
