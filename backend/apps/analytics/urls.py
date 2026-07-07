from django.urls import path

from apps.analytics.views import PlatformSummaryView

app_name = "analytics"

urlpatterns = [
    path("summary/", PlatformSummaryView.as_view(), name="summary"),
]
