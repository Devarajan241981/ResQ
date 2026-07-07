from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from apps.common.permissions import IsOwnerOrReadOnly, IsVerifiedReporter
from apps.missing_persons import selectors, services
from apps.missing_persons.serializers import (
    MissingPersonPhotoSerializer,
    MissingPersonReportSerializer,
    MissingPersonStatusUpdateSerializer,
    PublicMissingPersonSerializer,
    SightingReportSerializer,
)


class MissingPersonReportViewSet(viewsets.ModelViewSet):
    serializer_class = MissingPersonReportSerializer
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status", "gender"]
    throttle_scope = "report-create"

    def get_queryset(self):
        return selectors.get_report_queryset()

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsVerifiedReporter()]
        if self.action in ("update", "partial_update", "destroy", "update_status"):
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.IsAuthenticated()]

    def get_throttles(self):
        if self.action == "create":
            return [ScopedRateThrottle()]
        return super().get_throttles()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        contacts_data = serializer.validated_data.pop("emergency_contacts", [])
        report = services.create_report(
            reported_by=request.user,
            validated_data=serializer.validated_data,
            contacts_data=contacts_data,
            photo_files=request.FILES.getlist("photos"),
        )
        return Response(self.get_serializer(report).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="photos")
    def upload_photo(self, request, pk=None):
        report = self.get_object()
        image = request.FILES.get("image")
        if not image:
            return Response({"detail": "image file is required."}, status=400)
        photo = services.add_photo(report, image)
        return Response(MissingPersonPhotoSerializer(photo).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="sightings")
    def add_sighting(self, request, pk=None):
        report = self.get_object()
        serializer = SightingReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sighting = services.add_sighting(report, request.user, serializer.validated_data)
        return Response(SightingReportSerializer(sighting).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        report = self.get_object()
        serializer = MissingPersonStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = services.update_status(report, serializer.validated_data["status"])
        return Response(self.get_serializer(report).data)

    @action(detail=True, methods=["get"], url_path="duplicates")
    def duplicates(self, request, pk=None):
        report = self.get_object()
        possible = selectors.find_possible_duplicates(report)
        return Response(self.get_serializer(possible, many=True).data)


class PublicMissingPersonDetailView(generics.RetrieveAPIView):
    """Unauthenticated read-only view used by the QR code / public share link."""

    serializer_class = PublicMissingPersonSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "public_slug"
    lookup_url_kwarg = "slug"

    def get_queryset(self):
        return selectors.get_public_report_queryset()
