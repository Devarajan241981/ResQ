from rest_framework import serializers

from apps.sos.models import SOSAlert, SOSLocationPing, TrustedContact


class TrustedContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrustedContact
        fields = ("id", "name", "phone", "relationship")
        read_only_fields = ("id",)


class SOSLocationPingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOSLocationPing
        fields = ("id", "latitude", "longitude", "recorded_at")
        read_only_fields = ("id", "recorded_at")


class SOSAlertSerializer(serializers.ModelSerializer):
    pings = SOSLocationPingSerializer(many=True, read_only=True)

    class Meta:
        model = SOSAlert
        fields = (
            "id",
            "status",
            "notes",
            "media",
            "latitude",
            "longitude",
            "pings",
            "resolved_at",
            "created_at",
        )
        read_only_fields = ("id", "status", "pings", "resolved_at", "created_at")
