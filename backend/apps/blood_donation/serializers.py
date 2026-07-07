from rest_framework import serializers

from apps.blood_donation.models import BloodRequest, BloodRequestResponse, DonorProfile


class DonorProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    distance_km = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = DonorProfile
        fields = (
            "id",
            "user",
            "full_name",
            "blood_group",
            "city",
            "is_available",
            "last_donated_at",
            "latitude",
            "longitude",
            "distance_km",
        )
        read_only_fields = ("id", "user")


class BloodRequestResponseSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source="donor.full_name", read_only=True)

    class Meta:
        model = BloodRequestResponse
        fields = ("id", "donor", "donor_name", "status", "created_at")
        read_only_fields = ("id", "donor", "status", "created_at")


class BloodRequestSerializer(serializers.ModelSerializer):
    responses = BloodRequestResponseSerializer(many=True, read_only=True)

    class Meta:
        model = BloodRequest
        fields = (
            "id",
            "patient_name",
            "blood_group",
            "units_needed",
            "hospital",
            "city",
            "urgency",
            "status",
            "notes",
            "latitude",
            "longitude",
            "responses",
            "created_at",
        )
        read_only_fields = ("id", "status", "responses", "created_at")
