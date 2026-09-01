from rest_framework import serializers

from apps.events.models import Event, EventRSVP


class EventSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source="created_by.full_name", read_only=True)
    rsvp_count = serializers.SerializerMethodField()
    has_rsvped = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = (
            "id",
            "created_by",
            "creator_name",
            "title",
            "description",
            "category",
            "event_date",
            "start_time",
            "location",
            "city",
            "is_public",
            "rsvp_count",
            "has_rsvped",
            "created_at",
        )
        read_only_fields = ("id", "created_by", "creator_name", "rsvp_count", "has_rsvped", "created_at")

    def get_rsvp_count(self, obj) -> int:
        return obj.rsvps.count()

    def get_has_rsvped(self, obj) -> bool:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return EventRSVP.objects.filter(event=obj, user=request.user).exists()
