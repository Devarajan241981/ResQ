import json

from channels.generic.websocket import AsyncJsonWebsocketConsumer


class DisasterEventConsumer(AsyncJsonWebsocketConsumer):
    """Broadcasts new status reports / assignments for a disaster event to subscribed dashboards."""

    async def connect(self):
        self.event_id = self.scope["url_route"]["kwargs"]["event_id"]
        self.group_name = f"disaster_{self.event_id}"

        if not self.scope["user"] or not self.scope["user"].is_authenticated:
            await self.close(code=4401)
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def status_report_created(self, event):
        await self.send(text_data=json.dumps(event["payload"]))
