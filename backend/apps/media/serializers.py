from rest_framework import serializers


class PresignedUploadRequestSerializer(serializers.Serializer):
    content_type = serializers.ChoiceField(choices=["image/jpeg", "image/png", "image/webp"])
    folder = serializers.CharField(required=False, default="uploads")
