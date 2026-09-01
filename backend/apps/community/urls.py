from rest_framework.routers import DefaultRouter

from apps.community.views import CommunityPostViewSet, CommunityViewSet

app_name = "community"

router = DefaultRouter()
router.register("posts", CommunityPostViewSet, basename="community-post")
router.register("", CommunityViewSet, basename="community")

urlpatterns = router.urls
