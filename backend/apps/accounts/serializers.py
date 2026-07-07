from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.accounts.models import DeviceSession, OTPPurpose, Role

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "full_name",
            "email",
            "phone",
            "role",
            "is_verified",
            "preferred_language",
            "profile_photo",
            "date_joined",
        )
        read_only_fields = ("id", "role", "is_verified", "date_joined")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ("full_name", "email", "phone", "password", "preferred_language", "role")

    def validate_role(self, value):
        # Citizens self-register only as citizen/volunteer; other roles require admin provisioning.
        if value not in (Role.CITIZEN, Role.VOLUNTEER):
            raise serializers.ValidationError("This role cannot be self-assigned during registration.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class EmailLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class OTPRequestSerializer(serializers.Serializer):
    phone = serializers.CharField()
    purpose = serializers.ChoiceField(choices=OTPPurpose.choices, default=OTPPurpose.LOGIN)


class OTPVerifySerializer(serializers.Serializer):
    phone = serializers.CharField()
    code = serializers.CharField(max_length=10)
    purpose = serializers.ChoiceField(choices=OTPPurpose.choices, default=OTPPurpose.LOGIN)
    full_name = serializers.CharField(required=False, allow_blank=True)


class GoogleLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField()


class DeviceSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceSession
        fields = ("id", "device_id", "device_name", "user_agent", "ip_address", "created_at", "last_used_at")
        read_only_fields = fields
