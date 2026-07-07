from rest_framework import serializers

from apps.audit_logs.models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.full_name", read_only=True)

    class Meta:
        model = AuditLog
        fields = (
            "id",
            "actor",
            "actor_name",
            "action",
            "request_id",
            "method",
            "path",
            "status_code",
            "ip_address",
            "metadata",
            "created_at",
        )
        read_only_fields = fields
