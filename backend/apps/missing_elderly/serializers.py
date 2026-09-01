from rest_framework import serializers

from apps.missing_elderly.models import MissingElderlyReport


class MissingElderlyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MissingElderlyReport
        fields = (
            "id",
            "name",
            "age",
            "gender",
            "photo",
            "has_dementia",
            "has_alzheimers",
            "medical_history",
            "last_seen_location",
            "last_seen_at",
            "latitude",
            "longitude",
            "status",
            "created_at",
        )
        read_only_fields = ("id", "status", "created_at")


class PublicMissingElderlySerializer(serializers.ModelSerializer):
    """PII-safe feed — the dementia/Alzheimer's flags help finders, but detailed
    medical history stays private."""

    class Meta:
        model = MissingElderlyReport
        fields = (
            "id",
            "name",
            "age",
            "gender",
            "photo",
            "has_dementia",
            "has_alzheimers",
            "last_seen_location",
            "last_seen_at",
            "status",
            "created_at",
        )
        read_only_fields = fields
