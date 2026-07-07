from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.geo import filter_within_radius
from apps.common.permissions import IsAdmin
from apps.hospitals.models import Hospital
from apps.hospitals.serializers import HospitalSerializer


class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["city", "hospital_type", "has_blood_bank", "has_trauma_center"]

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
        radius_km = float(request.query_params.get("radius_km", 10))

        results = filter_within_radius(self.get_queryset(), lat, lng, radius_km)
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)
