from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.blood_donation import services
from apps.blood_donation.models import BloodRequest, BloodRequestResponse, BloodRequestStatus, DonorProfile
from apps.blood_donation.serializers import (
    BloodRequestResponseSerializer,
    BloodRequestSerializer,
    DonorProfileSerializer,
)
from apps.common.geo import filter_within_radius


class DonorProfileViewSet(viewsets.ModelViewSet):
    serializer_class = DonorProfileSerializer
    queryset = DonorProfile.objects.select_related("user").all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["blood_group", "city", "is_available"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def nearby(self, request):
        try:
            lat = float(request.query_params["lat"])
            lng = float(request.query_params["lng"])
        except (KeyError, ValueError):
            return Response({"detail": "lat and lng query params are required."}, status=400)
        radius_km = float(request.query_params.get("radius_km", 15))

        qs = self.filter_queryset(self.get_queryset()).filter(is_available=True)
        results = filter_within_radius(qs, lat, lng, radius_km)
        return Response(self.get_serializer(results, many=True).data)


class BloodRequestViewSet(viewsets.ModelViewSet):
    serializer_class = BloodRequestSerializer
    queryset = BloodRequest.objects.prefetch_related("responses").all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["blood_group", "city", "status", "urgency"]

    def get_permissions(self):
        if self.action in ("create",):
            return [permissions.IsAuthenticated()]
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        blood_request = serializer.save(requested_by=self.request.user)
        services.notify_matching_donors(blood_request)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def respond(self, request, pk=None):
        blood_request = self.get_object()
        response, _ = BloodRequestResponse.objects.get_or_create(request=blood_request, donor=request.user)
        return Response(BloodRequestResponseSerializer(response).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def fulfill(self, request, pk=None):
        blood_request = self.get_object()
        blood_request.status = BloodRequestStatus.FULFILLED
        blood_request.save(update_fields=["status"])
        return Response(self.get_serializer(blood_request).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        blood_request = self.get_object()
        blood_request.status = BloodRequestStatus.CANCELLED
        blood_request.save(update_fields=["status"])
        return Response(self.get_serializer(blood_request).data)
