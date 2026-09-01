from rest_framework import serializers

from apps.accounts.models import User


class AdminUserSerializer(serializers.ModelSerializer):
    organization_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "full_name",
            "email",
            "phone",
            "role",
            "city",
            "is_verified",
            "is_active",
            "organization_name",
            "date_joined",
        )
        read_only_fields = fields

    def get_organization_name(self, obj) -> str | None:
        ngo_profile = getattr(obj, "ngo_profile", None)
        return ngo_profile.org_name if ngo_profile else None
