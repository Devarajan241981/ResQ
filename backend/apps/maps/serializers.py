from rest_framework import serializers


class GeocodeQuerySerializer(serializers.Serializer):
    query = serializers.CharField()


class RouteQuerySerializer(serializers.Serializer):
    start_lat = serializers.FloatField()
    start_lng = serializers.FloatField()
    end_lat = serializers.FloatField()
    end_lng = serializers.FloatField()
    profile = serializers.ChoiceField(
        choices=["driving-car", "cycling-regular", "foot-walking"], default="driving-car"
    )
