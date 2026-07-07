from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.geo import filter_within_radius
from apps.common.permissions import IsAdmin
from apps.shelters.models import Shelter
from apps.shelters.serializers import ShelterSerializer


class ShelterViewSet(viewsets.ModelViewSet):
    queryset = Shelter.objects.filter(is_active=True)
    serializer_class = ShelterSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["city", "shelter_type", "disaster_event"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdmin()]
        return [permissions.AllowAny()]

    @action(detail=False, methods=["get"])
    def nearby(self, request):
        try:
            lat = float(request.query_params["lat"])
            lng = float(request.query_params["lng"])
        except (KeyError, ValueError):
            return Response({"detail": "lat and lng query params are required."}, status=400)
        radius_km = float(request.query_params.get("radius_km", 15))

        results = filter_within_radius(self.get_queryset(), lat, lng, radius_km)
        return Response(self.get_serializer(results, many=True).data)
