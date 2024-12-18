from channels.generic.websocket import AsyncWebsocketConsumer
import json


class ProgressConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "chat_room"

        # Add the WebSocket to the group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Remove the WebSocket from the group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        user = self.scope["user"]  # Get the current user from the WebSocket scope
        if not user.is_authenticated:
            # Handle unauthenticated users
            await self.send(text_data=json.dumps({"error": "User not authenticated"}))
            return

        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Send message to the group, including the user ID
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "chat_message", "message": message, "user_id": user.id},
        )

    # Receive message from the group
    async def chat_message(self, event):
        message = event["message"]
        user_id = event["user_id"]

        # Send message to WebSocket, including the user ID
        await self.send(text_data=json.dumps({"message": message, "user_id": user_id}))
