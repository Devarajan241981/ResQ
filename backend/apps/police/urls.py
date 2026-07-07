from rest_framework.routers import DefaultRouter

from apps.police.views import PoliceStationViewSet

app_name = "police"

router = DefaultRouter()
router.register("stations", PoliceStationViewSet, basename="police-station")

urlpatterns = router.urls
