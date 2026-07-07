from django.utils import timezone
from rest_framework import serializers


def validate_last_seen_at(value):
    if value > timezone.now():
        raise serializers.ValidationError("last_seen_at cannot be in the future.")
    return value


def validate_age(value):
    if value > 120:
        raise serializers.ValidationError("age must be a realistic human age.")
    return value
