from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

api_v1_patterns = [
    path("auth/", include("apps.accounts.urls")),
    path("missing-persons/", include("apps.missing_persons.urls")),
    path("missing-children/", include("apps.missing_children.urls")),
    path("missing-elderly/", include("apps.missing_elderly.urls")),
    path("lost-pets/", include("apps.lost_pets.urls")),
    path("blood-donation/", include("apps.blood_donation.urls")),
    path("hospitals/", include("apps.hospitals.urls")),
    path("ambulance/", include("apps.ambulance.urls")),
    path("disaster-mode/", include("apps.disaster_mode.urls")),
    path("sos/", include("apps.sos.urls")),
    path("volunteers/", include("apps.volunteers.urls")),
    path("ngos/", include("apps.ngos.urls")),
    path("shelters/", include("apps.shelters.urls")),
    path("notifications/", include("apps.notifications.urls")),
    path("police/", include("apps.police.urls")),
    path("maps/", include("apps.maps.urls")),
    path("search/", include("apps.search.urls")),
    path("media/", include("apps.media.urls")),
    path("analytics/", include("apps.analytics.urls")),
    path("audit-logs/", include("apps.audit_logs.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(api_v1_patterns)),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
