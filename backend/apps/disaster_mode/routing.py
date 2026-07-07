from django.urls import re_path

from apps.disaster_mode.consumers import DisasterEventConsumer

websocket_urlpatterns = [
    re_path(r"^ws/disaster-mode/(?P<event_id>[0-9a-f-]+)/$", DisasterEventConsumer.as_asgi()),
]
