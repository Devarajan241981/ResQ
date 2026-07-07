from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.accounts.models import DeviceSession, Gender, OTPPurpose, Role
from apps.accounts.services.registration_service import register_user
from apps.blood_donation.models import BloodGroup

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
            "gender",
            "city",
            "date_joined",
        )
        read_only_fields = ("id", "role", "is_verified", "date_joined")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    gender = serializers.ChoiceField(choices=Gender.choices, required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    blood_group = serializers.ChoiceField(
        choices=BloodGroup.choices,
        required=False,
        write_only=True,
        help_text="Optional — registers the new account as a blood donor.",
    )

    class Meta:
        model = User
        fields = (
            "full_name",
            "email",
            "phone",
            "password",
            "preferred_language",
            "role",
            "gender",
            "city",
            "blood_group",
        )

    def validate_role(self, value):
        # Citizens self-register only as citizen/volunteer; other roles require admin provisioning.
        if value not in (Role.CITIZEN, Role.VOLUNTEER):
            raise serializers.ValidationError("This role cannot be self-assigned during registration.")
        return value

    def create(self, validated_data):
        return register_user(validated_data)


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
