from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.permissions import IsOwnerOrReadOnly, IsVerifiedOrganizer
from apps.events import selectors, services
from apps.events.models import Event
from apps.events.serializers import EventSerializer


class IsCreatorOrReadOnly(IsOwnerOrReadOnly):
    owner_field = "created_by"


class EventViewSet(viewsets.ModelViewSet):
    """Public community events. Anyone can browse; verified NGOs/admins create;
    authenticated users RSVP to add an event to their calendar."""

    serializer_class = EventSerializer

    def get_queryset(self):
        qs = selectors.get_events_queryset()
        month = self.request.query_params.get("month")  # "YYYY-MM"
        if month:
            try:
                year_s, month_s = month.split("-")
                qs = selectors.events_in_month(int(year_s), int(month_s))
            except (ValueError, TypeError):
                pass
        return qs

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsCreatorOrReadOnly()]
        if self.action in ("rsvp", "cancel_rsvp", "mine"):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsVerifiedOrganizer()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def rsvp(self, request, pk=None):
        event = self.get_object()
        services.rsvp(event, request.user)
        return Response(self.get_serializer(event).data)

    @action(detail=True, methods=["post"], url_path="cancel-rsvp")
    def cancel_rsvp(self, request, pk=None):
        event = self.get_object()
        services.cancel_rsvp(event, request.user)
        return Response(self.get_serializer(event).data)

    @action(detail=False, methods=["get"])
    def mine(self, request):
        events = Event.objects.filter(rsvps__user=request.user).select_related("created_by").distinct()
        return Response(self.get_serializer(events, many=True).data)
