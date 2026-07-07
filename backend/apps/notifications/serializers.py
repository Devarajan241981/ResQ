from rest_framework import serializers

from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = (
            "id",
            "notification_type",
            "channel",
            "title",
            "body",
            "data",
            "is_read",
            "sent_at",
            "created_at",
        )
        read_only_fields = fields
