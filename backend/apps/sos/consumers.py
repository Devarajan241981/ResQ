import json

from channels.generic.websocket import AsyncJsonWebsocketConsumer


class SOSLocationConsumer(AsyncJsonWebsocketConsumer):
    """
    Broadcasts live location pings for a single SOS alert to anyone subscribed
    (trusted contacts' apps, admin dashboard). Group name: sos_<alert_id>.
    """

    async def connect(self):
        self.alert_id = self.scope["url_route"]["kwargs"]["alert_id"]
        self.group_name = f"sos_{self.alert_id}"

        if not self.scope["user"] or not self.scope["user"].is_authenticated:
            await self.close(code=4401)
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        # Clients push {"latitude": .., "longitude": ..} location pings.
        await self.channel_layer.group_send(
            self.group_name,
            {"type": "location.update", "payload": content},
        )

    async def location_update(self, event):
        await self.send(text_data=json.dumps(event["payload"]))
