from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.models import User
from apps.admin_panel import selectors
from apps.admin_panel.serializers import AdminUserSerializer
from apps.common.permissions import IsAdmin


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin/super-admin only: browse, verify, and suspend platform accounts."""

    serializer_class = AdminUserSerializer
    queryset = User.objects.select_related("ngo_profile").order_by("-date_joined")
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["role", "is_verified", "is_active"]
    search_fields = ["full_name", "email", "phone"]

    @action(detail=False, url_path="pending-ngo-verifications")
    def pending_ngo_verifications(self, request):
        page = self.paginate_queryset(selectors.get_pending_ngo_verifications())
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=True, methods=["post"])
    def verify(self, request, pk=None):
        user = self.get_object()
        user.is_verified = True
        user.save(update_fields=["is_verified"])
        return Response(self.get_serializer(user).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        """Rejects a pending verification (e.g. a bogus NGO signup) without deleting the account."""
        user = self.get_object()
        user.is_verified = False
        user.is_active = False
        user.save(update_fields=["is_verified", "is_active"])
        return Response(self.get_serializer(user).data)

    @action(detail=True, methods=["post"])
    def suspend(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response(self.get_serializer(user).data)

    @action(detail=True, methods=["post"])
    def reactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save(update_fields=["is_active"])
        return Response(self.get_serializer(user).data)
