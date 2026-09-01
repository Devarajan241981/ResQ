from django.http import HttpResponse
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.common.exceptions import DomainError
from apps.tts import services
from apps.tts.serializers import TtsQuerySerializer


class SynthesizeView(APIView):
    # The in-page assistant is available to signed-out visitors too, so this is
    # public — but throttled, and the reply text is length-capped in the serializer.
    serializer_class = TtsQuerySerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "tts"

    def post(self, request):
        serializer = TtsQuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            audio = services.synthesize(data["text"], data["language"])
        except DomainError as exc:
            return Response({"detail": exc.message}, status=exc.status_code)
        return HttpResponse(audio, content_type="audio/wav")
