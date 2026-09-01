from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.permissions import IsOwnerOrReadOnly, IsVerifiedOrganizer
from apps.community import services
from apps.community.models import Community, CommunityPost, CommunityPostLike
from apps.community.serializers import CommunityPostSerializer, CommunitySerializer


class IsCommunityOwnerOrReadOnly(IsOwnerOrReadOnly):
    owner_field = "owner"


class IsPostAuthorOrReadOnly(IsOwnerOrReadOnly):
    owner_field = "author"


class CommunityViewSet(viewsets.ModelViewSet):
    serializer_class = CommunitySerializer
    queryset = Community.objects.filter(is_active=True).select_related("owner")

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsVerifiedOrganizer()]
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsCommunityOwnerOrReadOnly()]
        if self.action in ("join", "leave"):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        from apps.community.models import CommunityMembership

        community = self.get_object()
        CommunityMembership.objects.get_or_create(community=community, user=request.user)
        return Response(self.get_serializer(community).data)

    @action(detail=True, methods=["post"])
    def leave(self, request, pk=None):
        from apps.community.models import CommunityMembership

        community = self.get_object()
        CommunityMembership.objects.filter(community=community, user=request.user).delete()
        return Response(self.get_serializer(community).data)


class CommunityPostViewSet(viewsets.ModelViewSet):
    serializer_class = CommunityPostSerializer
    queryset = CommunityPost.objects.select_related("author", "community").order_by("-created_at")
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["community"]

    def get_permissions(self):
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsPostAuthorOrReadOnly()]
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        if self.action in ("like", "unlike"):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        community = serializer.validated_data.pop("community")
        content = serializer.validated_data.pop("content")
        image = serializer.validated_data.pop("image", None)
        post = services.create_post(community, self.request.user, content, image)
        serializer.instance = post

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        post = self.get_object()
        CommunityPostLike.objects.get_or_create(post=post, user=request.user)
        return Response(self.get_serializer(post).data)

    @action(detail=True, methods=["post"])
    def unlike(self, request, pk=None):
        post = self.get_object()
        CommunityPostLike.objects.filter(post=post, user=request.user).delete()
        return Response(self.get_serializer(post).data)
