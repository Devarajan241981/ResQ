from rest_framework import serializers

from apps.missing_children.models import MissingChildReport


class MissingChildReportSerializer(serializers.ModelSerializer):
    """Full shape — used for create/retrieve by the reporter."""

    class Meta:
        model = MissingChildReport
        fields = (
            "id",
            "name",
            "age",
            "gender",
            "photo",
            "guardian_name",
            "guardian_phone",
            "last_seen_location",
            "last_seen_at",
            "school_name",
            "latitude",
            "longitude",
            "status",
            "is_extra_verified",
            "created_at",
        )
        read_only_fields = ("id", "status", "is_extra_verified", "created_at")


class PublicMissingChildSerializer(serializers.ModelSerializer):
    """PII-safe feed shape — the guardian's phone number stays private."""

    class Meta:
        model = MissingChildReport
        fields = (
            "id",
            "name",
            "age",
            "gender",
            "photo",
            "last_seen_location",
            "last_seen_at",
            "status",
            "created_at",
        )
        read_only_fields = fields
