from django.urls import path

from apps.tts.views import SynthesizeView

app_name = "tts"

urlpatterns = [
    path("", SynthesizeView.as_view(), name="synthesize"),
]
