from rest_framework.routers import DefaultRouter

from apps.audit_logs.views import AuditLogViewSet

app_name = "audit_logs"

router = DefaultRouter()
router.register("", AuditLogViewSet, basename="audit-log")

urlpatterns = router.urls
