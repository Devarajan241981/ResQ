from rest_framework.routers import DefaultRouter

from apps.volunteers.views import VolunteerProfileViewSet

app_name = "volunteers"

router = DefaultRouter()
router.register("", VolunteerProfileViewSet, basename="volunteer")

urlpatterns = router.urls
