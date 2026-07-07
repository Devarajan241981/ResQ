from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.geo import filter_within_radius
from apps.common.permissions import IsAdmin
from apps.volunteers.models import VolunteerProfile
from apps.volunteers.serializers import VolunteerProfileSerializer


class VolunteerProfileViewSet(viewsets.ModelViewSet):
    serializer_class = VolunteerProfileSerializer
    queryset = VolunteerProfile.objects.select_related("user").all()

    def get_permissions(self):
        if self.action == "verify":
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def nearby(self, request):
        try:
            lat = float(request.query_params["lat"])
            lng = float(request.query_params["lng"])
        except (KeyError, ValueError):
            return Response({"detail": "lat and lng query params are required."}, status=400)
        radius_km = float(request.query_params.get("radius_km", 10))
        skill = request.query_params.get("skill")

        qs = self.get_queryset().filter(is_verified=True, is_available=True)
        if skill:
            qs = qs.filter(skills__contains=[skill])

        results = filter_within_radius(qs, lat, lng, radius_km)
        return Response(self.get_serializer(results, many=True).data)

    @action(detail=True, methods=["post"])
    def verify(self, request, pk=None):
        profile = self.get_object()
        profile.is_verified = True
        profile.save(update_fields=["is_verified"])
        return Response(self.get_serializer(profile).data)
