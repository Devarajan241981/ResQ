from rest_framework.routers import DefaultRouter

from apps.missing_children.views import MissingChildReportViewSet

app_name = "missing_children"

router = DefaultRouter()
router.register("", MissingChildReportViewSet, basename="missing-child")

urlpatterns = router.urls
