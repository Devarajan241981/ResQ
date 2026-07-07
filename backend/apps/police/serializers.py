from rest_framework import serializers

from apps.police.models import CaseForwardRecord, PoliceStation


class PoliceStationSerializer(serializers.ModelSerializer):
    distance_km = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = PoliceStation
        fields = (
            "id",
            "name",
            "station_code",
            "jurisdiction_area",
            "address",
            "city",
            "state",
            "phone",
            "is_active",
            "latitude",
            "longitude",
            "distance_km",
        )
        read_only_fields = ("id",)


class CaseForwardRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseForwardRecord
        fields = (
            "id",
            "police_station",
            "report_type",
            "report_id",
            "status",
            "reference_number",
            "notes",
            "created_at",
        )
        read_only_fields = ("id", "status", "reference_number", "created_at")
