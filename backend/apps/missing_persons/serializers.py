from rest_framework import serializers

from apps.missing_persons.models import (
    EmergencyContact,
    MissingPersonPhoto,
    MissingPersonReport,
    SightingReport,
)
from apps.missing_persons.services import public_share_url
from apps.missing_persons.validators import validate_age, validate_last_seen_at


class MissingPersonPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MissingPersonPhoto
        fields = ("id", "image", "created_at")
        read_only_fields = ("id", "created_at")


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ("id", "name", "phone", "relationship")
        read_only_fields = ("id",)


class SightingReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SightingReport
        fields = (
            "id",
            "description",
            "location_text",
            "latitude",
            "longitude",
            "sighted_at",
            "photo",
            "created_at",
        )
        read_only_fields = ("id", "created_at")


class MissingPersonReportSerializer(serializers.ModelSerializer):
    photos = MissingPersonPhotoSerializer(many=True, read_only=True)
    emergency_contacts = EmergencyContactSerializer(many=True, required=False)
    sightings = SightingReportSerializer(many=True, read_only=True)
    share_url = serializers.SerializerMethodField()
    last_seen_at = serializers.DateTimeField(validators=[validate_last_seen_at])
    age = serializers.IntegerField(validators=[validate_age])

    class Meta:
        model = MissingPersonReport
        fields = (
            "id",
            "public_slug",
            "share_url",
            "name",
            "age",
            "gender",
            "height_cm",
            "weight_kg",
            "clothing_description",
            "last_seen_location",
            "last_seen_at",
            "latitude",
            "longitude",
            "medical_conditions",
            "languages_spoken",
            "status",
            "risk_score",
            "ai_summary",
            "qr_code",
            "photos",
            "emergency_contacts",
            "sightings",
            "created_at",
        )
        read_only_fields = (
            "id",
            "public_slug",
            "share_url",
            "status",
            "risk_score",
            "ai_summary",
            "qr_code",
            "created_at",
        )

    def get_share_url(self, obj) -> str:
        return public_share_url(obj)


class PublicMissingPersonSerializer(serializers.ModelSerializer):
    """Reduced field set safe for unauthenticated public sharing (no reporter/contact PII)."""

    photos = MissingPersonPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = MissingPersonReport
        fields = (
            "public_slug",
            "name",
            "age",
            "gender",
            "clothing_description",
            "last_seen_location",
            "last_seen_at",
            "status",
            "photos",
            "created_at",
        )


class MissingPersonStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=MissingPersonReport._meta.get_field("status").choices)
