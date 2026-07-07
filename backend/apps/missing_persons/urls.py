from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.missing_persons.views import MissingPersonReportViewSet, PublicMissingPersonDetailView

app_name = "missing_persons"

router = DefaultRouter()
router.register("", MissingPersonReportViewSet, basename="missing-person")

urlpatterns = [
    path("public/<slug:slug>/", PublicMissingPersonDetailView.as_view(), name="public-detail"),
] + router.urls
