from rest_framework import serializers

from apps.shelters.models import Shelter


class ShelterSerializer(serializers.ModelSerializer):
    available_capacity = serializers.IntegerField(read_only=True)
    distance_km = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = Shelter
        fields = (
            "id",
            "name",
            "shelter_type",
            "address",
            "city",
            "capacity",
            "current_occupancy",
            "available_capacity",
            "contact_phone",
            "is_active",
            "disaster_event",
            "latitude",
            "longitude",
            "distance_km",
            "created_at",
        )
        read_only_fields = ("id", "created_at")
