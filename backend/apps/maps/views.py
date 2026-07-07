from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.common.exceptions import DomainError
from apps.maps import services
from apps.maps.serializers import GeocodeQuerySerializer, RouteQuerySerializer


class GeocodeView(APIView):
    serializer_class = GeocodeQuerySerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "maps"

    def get(self, request):
        serializer = GeocodeQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        try:
            features = services.geocode(serializer.validated_data["query"])
        except DomainError as exc:
            return Response({"detail": exc.message}, status=exc.status_code)
        return Response({"features": features})


class RouteView(APIView):
    serializer_class = RouteQuerySerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "maps"

    def get(self, request):
        serializer = RouteQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            route = services.get_route(
                data["start_lng"], data["start_lat"], data["end_lng"], data["end_lat"], data["profile"]
            )
        except DomainError as exc:
            return Response({"detail": exc.message}, status=exc.status_code)
        return Response(route)
