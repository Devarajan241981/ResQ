from django.urls import path

from apps.media.views import PresignedUploadView

app_name = "media"

urlpatterns = [
    path("presigned-upload/", PresignedUploadView.as_view(), name="presigned-upload"),
]
