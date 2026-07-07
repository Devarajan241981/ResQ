from rest_framework import serializers

from apps.volunteers.models import VolunteerProfile


class VolunteerProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    distance_km = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = VolunteerProfile
        fields = (
            "id",
            "user",
            "full_name",
            "skills",
            "is_verified",
            "is_available",
            "reputation_score",
            "completed_tasks",
            "bio",
            "latitude",
            "longitude",
            "distance_km",
            "last_active_at",
        )
        read_only_fields = ("id", "user", "is_verified", "reputation_score", "completed_tasks")
