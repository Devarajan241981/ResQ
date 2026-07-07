from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.search.backends import get_backend
from apps.search.serializers import SearchQuerySerializer


class SearchView(APIView):
    serializer_class = SearchQuerySerializer
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        serializer = SearchQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        results = get_backend().search(data["q"], data["limit"])
        return Response({"results": results})
