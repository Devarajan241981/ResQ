from rest_framework.routers import DefaultRouter

from apps.shelters.views import ShelterViewSet

app_name = "shelters"

router = DefaultRouter()
router.register("", ShelterViewSet, basename="shelter")

urlpatterns = router.urls
