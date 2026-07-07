from django.urls import path

from apps.maps.views import GeocodeView, RouteView

app_name = "maps"

urlpatterns = [
    path("geocode/", GeocodeView.as_view(), name="geocode"),
    path("route/", RouteView.as_view(), name="route"),
]
