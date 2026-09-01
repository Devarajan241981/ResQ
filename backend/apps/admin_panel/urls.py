from rest_framework.routers import DefaultRouter

from apps.admin_panel.views import AdminUserViewSet

app_name = "admin_panel"

router = DefaultRouter()
router.register("users", AdminUserViewSet, basename="admin-user")

urlpatterns = router.urls
