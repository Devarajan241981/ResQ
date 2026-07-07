import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

from channels.auth import AuthMiddlewareStack  # noqa: E402
from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
from django.core.asgi import get_asgi_application  # noqa: E402

django_asgi_app = get_asgi_application()

from apps.sos.routing import websocket_urlpatterns as sos_ws_urlpatterns  # noqa: E402
from apps.disaster_mode.routing import (  # noqa: E402
    websocket_urlpatterns as disaster_ws_urlpatterns,
)

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(sos_ws_urlpatterns + disaster_ws_urlpatterns)
        ),
    }
)
