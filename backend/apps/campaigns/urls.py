from rest_framework.routers import DefaultRouter

from apps.campaigns.views import CampaignRegistrationViewSet, CampaignViewSet

app_name = "campaigns"

router = DefaultRouter()
router.register("registrations", CampaignRegistrationViewSet, basename="campaign-registration")
router.register("", CampaignViewSet, basename="campaign")

urlpatterns = router.urls
