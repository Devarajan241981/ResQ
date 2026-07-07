from rest_framework.routers import DefaultRouter

from apps.hospitals.views import HospitalViewSet

app_name = "hospitals"

router = DefaultRouter()
router.register("", HospitalViewSet, basename="hospital")

urlpatterns = router.urls
