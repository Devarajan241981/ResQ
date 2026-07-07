from rest_framework.response import Response
from rest_framework.views import APIView

from apps.analytics import selectors
from apps.common.permissions import IsAdmin


class PlatformSummaryView(APIView):
    serializer_class = None
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response(selectors.platform_summary())
