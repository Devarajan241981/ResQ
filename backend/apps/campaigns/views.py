from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.campaigns import services
from apps.campaigns.models import Campaign, CampaignRegistration, CampaignRegistrationStatus, CampaignStatus
from apps.campaigns.serializers import CampaignRegistrationSerializer, CampaignSerializer
from apps.common.permissions import IsOwnerOrReadOnly, IsVerifiedOrganizer


class IsCampaignOrganizerOrReadOnly(IsOwnerOrReadOnly):
    owner_field = "organizer"


class CampaignViewSet(viewsets.ModelViewSet):
    serializer_class = CampaignSerializer
    queryset = Campaign.objects.select_related("organizer").all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category", "city", "status"]

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsVerifiedOrganizer()]
        if self.action in ("update", "partial_update", "destroy", "close", "cancel"):
            return [permissions.IsAuthenticated(), IsCampaignOrganizerOrReadOnly()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        campaign = self.get_object()
        campaign.status = CampaignStatus.CLOSED
        campaign.save(update_fields=["status"])
        return Response(self.get_serializer(campaign).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        campaign = self.get_object()
        campaign.status = CampaignStatus.CANCELLED
        campaign.save(update_fields=["status"])
        return Response(self.get_serializer(campaign).data)


class CampaignRegistrationViewSet(viewsets.ModelViewSet):
    serializer_class = CampaignRegistrationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["campaign", "status"]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return CampaignRegistration.objects.filter(Q(user=user) | Q(campaign__organizer=user)).select_related(
            "campaign", "user"
        )

    def perform_create(self, serializer):
        campaign = serializer.validated_data.pop("campaign")
        registration = services.register_for_campaign(campaign, self.request.user, serializer.validated_data)
        serializer.instance = registration

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        registration = self.get_object()
        if registration.user_id != request.user.id and not request.user.is_superuser:
            return Response({"detail": "You can only cancel your own registration."}, status=403)
        registration.status = CampaignRegistrationStatus.CANCELLED
        registration.save(update_fields=["status"])
        return Response(self.get_serializer(registration).data)
