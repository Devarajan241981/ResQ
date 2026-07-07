from rest_framework.routers import DefaultRouter

from apps.disaster_mode.views import DisasterEventViewSet, StatusReportViewSet, VolunteerAssignmentViewSet

app_name = "disaster_mode"

router = DefaultRouter()
router.register("events", DisasterEventViewSet, basename="disaster-event")
router.register("status-reports", StatusReportViewSet, basename="status-report")
router.register("assignments", VolunteerAssignmentViewSet, basename="volunteer-assignment")

urlpatterns = router.urls
