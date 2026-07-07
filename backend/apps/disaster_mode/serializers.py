from rest_framework import serializers

from apps.disaster_mode.models import DisasterEvent, StatusReport, VolunteerAssignment


class StatusReportSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = StatusReport
        fields = (
            "id",
            "event",
            "user",
            "user_name",
            "need_type",
            "notes",
            "latitude",
            "longitude",
            "is_resolved",
            "created_at",
        )
        read_only_fields = ("id", "user", "user_name", "is_resolved", "created_at")


class VolunteerAssignmentSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.CharField(source="volunteer.full_name", read_only=True)

    class Meta:
        model = VolunteerAssignment
        fields = (
            "id",
            "event",
            "volunteer",
            "volunteer_name",
            "status_report",
            "status",
            "assigned_at",
            "completed_at",
        )
        read_only_fields = ("id", "assigned_at")


class DisasterEventSerializer(serializers.ModelSerializer):
    open_needs_count = serializers.SerializerMethodField()

    class Meta:
        model = DisasterEvent
        fields = (
            "id",
            "name",
            "disaster_type",
            "description",
            "affected_area",
            "radius_km",
            "status",
            "latitude",
            "longitude",
            "started_at",
            "ended_at",
            "open_needs_count",
            "created_at",
        )
        read_only_fields = ("id", "status", "created_at")

    def get_open_needs_count(self, obj) -> int:
        from apps.disaster_mode import selectors

        return selectors.get_open_needs(obj.id)
