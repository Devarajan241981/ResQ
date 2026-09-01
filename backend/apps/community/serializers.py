from rest_framework import serializers

from apps.community import selectors
from apps.community.models import Community, CommunityPost


class CommunitySerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.full_name", read_only=True)
    member_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = (
            "id",
            "owner",
            "owner_name",
            "name",
            "description",
            "banner_image",
            "city",
            "is_active",
            "member_count",
            "is_member",
            "created_at",
        )
        read_only_fields = ("id", "owner", "is_active", "created_at")

    def get_member_count(self, obj) -> int:
        return selectors.get_member_count(obj.id)

    def get_is_member(self, obj) -> bool:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return selectors.is_member(obj.id, request.user.id)


class CommunityPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.full_name", read_only=True)
    like_count = serializers.SerializerMethodField()
    has_liked = serializers.SerializerMethodField()

    class Meta:
        model = CommunityPost
        fields = (
            "id",
            "community",
            "author",
            "author_name",
            "content",
            "image",
            "like_count",
            "has_liked",
            "created_at",
        )
        read_only_fields = ("id", "author", "created_at")

    def get_like_count(self, obj) -> int:
        return selectors.get_like_count(obj.id)

    def get_has_liked(self, obj) -> bool:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return selectors.has_liked(obj.id, request.user.id)
