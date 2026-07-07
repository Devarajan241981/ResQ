from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.permissions import IsAdmin
from apps.police import selectors, services
from apps.police.models import PoliceStation
from apps.police.serializers import CaseForwardRecordSerializer, PoliceStationSerializer


class PoliceStationViewSet(viewsets.ModelViewSet):
    queryset = PoliceStation.objects.filter(is_active=True)
    serializer_class = PoliceStationSerializer

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
        results = selectors.get_nearby_stations(lat, lng, radius_km)
        return Response(self.get_serializer(results, many=True).data)

    @action(detail=True, methods=["post"], url_path="forward-case", permission_classes=[permissions.IsAuthenticated])
    def forward_case(self, request, pk=None):
        station = self.get_object()
        serializer = CaseForwardRecordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        record = services.forward_case(
            station, serializer.validated_data["report_type"], serializer.validated_data["report_id"]
        )
        return Response(CaseForwardRecordSerializer(record).data, status=201)
