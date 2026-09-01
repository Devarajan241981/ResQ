from rest_framework import serializers

from apps.gallery.models import GalleryImage


class GalleryImageSerializer(serializers.ModelSerializer):
    uploader_name = serializers.SerializerMethodField()

    class Meta:
        model = GalleryImage
        fields = ("id", "uploaded_by", "uploader_name", "image", "caption", "created_at")
        read_only_fields = ("id", "uploaded_by", "uploader_name", "created_at")

    def get_uploader_name(self, obj):
        ngo_profile = getattr(obj.uploaded_by, "ngo_profile", None)
        return ngo_profile.org_name if ngo_profile else obj.uploaded_by.full_name
