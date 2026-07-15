import json
from channels.generic.websocket import AsyncWebsocketConsumer

class AdminUpdateConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "admin_updates"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Receive message from room group
    async def admin_update(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'admin_update',
            'message': message
        }))
