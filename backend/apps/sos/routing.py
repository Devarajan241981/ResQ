from django.urls import re_path

from apps.sos.consumers import SOSLocationConsumer

websocket_urlpatterns = [
    re_path(r"^ws/sos/(?P<alert_id>[0-9a-f-]+)/$", SOSLocationConsumer.as_asgi()),
]
