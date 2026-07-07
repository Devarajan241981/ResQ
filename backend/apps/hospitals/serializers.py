from rest_framework import serializers

from apps.hospitals.models import Hospital


class HospitalSerializer(serializers.ModelSerializer):
    distance_km = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = Hospital
        fields = (
            "id",
            "name",
            "hospital_type",
            "address",
            "city",
            "state",
            "pincode",
            "phone",
            "emergency_phone",
            "has_blood_bank",
            "has_trauma_center",
            "is_verified",
            "latitude",
            "longitude",
            "distance_km",
            "created_at",
        )
        read_only_fields = ("id", "is_verified", "created_at")
