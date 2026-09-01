from rest_framework import serializers

from apps.campaigns import selectors
from apps.campaigns.models import Campaign, CampaignRegistration


class CampaignRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignRegistration
        fields = (
            "id",
            "campaign",
            "user",
            "full_name",
            "phone",
            "email",
            "team_name",
            "notes",
            "status",
            "created_at",
        )
        read_only_fields = ("id", "user", "status", "created_at")


class CampaignSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source="organizer.full_name", read_only=True)
    registered_count = serializers.SerializerMethodField()
    available_slots = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = (
            "id",
            "organizer",
            "organizer_name",
            "title",
            "category",
            "description",
            "city",
            "venue",
            "banner_image",
            "capacity",
            "registered_count",
            "available_slots",
            "starts_at",
            "ends_at",
            "registration_deadline",
            "status",
            "latitude",
            "longitude",
            "created_at",
        )
        read_only_fields = ("id", "organizer", "status", "created_at")

    def get_registered_count(self, obj) -> int:
        return selectors.get_active_registration_count(obj.id)

    def get_available_slots(self, obj) -> int | None:
        return selectors.get_available_slots(obj)
