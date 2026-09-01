from rest_framework import mixins, parsers, permissions, viewsets

from apps.common.permissions import IsOwnerOrReadOnly, IsVerifiedOrganizer
from apps.gallery.models import GalleryImage
from apps.gallery.serializers import GalleryImageSerializer


class IsUploaderOrReadOnly(IsOwnerOrReadOnly):
    owner_field = "uploaded_by"


class GalleryImageViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Public relief-work gallery. Anyone can browse; verified NGOs/admins publish."""

    serializer_class = GalleryImageSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_queryset(self):
        return GalleryImage.objects.select_related("uploaded_by").all()

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        if self.action == "destroy":
            return [permissions.IsAuthenticated(), IsUploaderOrReadOnly()]
        return [permissions.IsAuthenticated(), IsVerifiedOrganizer()]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
