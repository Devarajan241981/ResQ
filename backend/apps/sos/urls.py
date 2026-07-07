from rest_framework.routers import DefaultRouter

from apps.sos.views import SOSAlertViewSet, TrustedContactViewSet

app_name = "sos"

router = DefaultRouter()
router.register("alerts", SOSAlertViewSet, basename="sos-alert")
router.register("trusted-contacts", TrustedContactViewSet, basename="trusted-contact")

urlpatterns = router.urls
