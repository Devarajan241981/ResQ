from rest_framework.routers import DefaultRouter

from apps.blood_donation.views import BloodRequestViewSet, DonorProfileViewSet

app_name = "blood_donation"

router = DefaultRouter()
router.register("donors", DonorProfileViewSet, basename="donor")
router.register("requests", BloodRequestViewSet, basename="blood-request")

urlpatterns = router.urls
