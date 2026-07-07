from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.exceptions import DomainError
from apps.media import services
from apps.media.serializers import PresignedUploadRequestSerializer


class PresignedUploadView(APIView):
    serializer_class = PresignedUploadRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PresignedUploadRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            result = services.get_presigned_upload_url(**serializer.validated_data)
        except DomainError as exc:
            return Response({"detail": exc.message}, status=exc.status_code)
        return Response(result)
