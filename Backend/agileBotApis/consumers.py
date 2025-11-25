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


class ActivityConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time activity updates"""

    async def connect(self):
        """Handle WebSocket connection"""
        self.user = self.scope["user"]
        
        # Check authentication
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Get project_id from URL if provided
        self.project_id = self.scope["url_route"].get("kwargs", {}).get("project_id")
        
        # Subscribe to general activities channel
        self.general_group_name = "activities"
        await self.channel_layer.group_add(
            self.general_group_name,
            self.channel_name
        )
        
        # Subscribe to project-specific channel if project_id provided
        if self.project_id:
            self.project_group_name = f"project_{self.project_id}"
            await self.channel_layer.group_add(
                self.project_group_name,
                self.channel_name
            )
        
        await self.accept()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # Unsubscribe from general activities
        await self.channel_layer.group_discard(
            self.general_group_name,
            self.channel_name
        )
        
        # Unsubscribe from project-specific channel if exists
        if hasattr(self, 'project_group_name'):
            await self.channel_layer.group_discard(
                self.project_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Handle messages from WebSocket client"""
        try:
            data = json.loads(text_data)
            message_type = data.get("type")
            
            # Handle subscription requests
            if message_type == "subscribe_project":
                project_id = data.get("project_id")
                if project_id:
                    group_name = f"project_{project_id}"
                    await self.channel_layer.group_add(group_name, self.channel_name)
                    await self.send(text_data=json.dumps({
                        "type": "subscription_success",
                        "project_id": project_id
                    }))
            
            elif message_type == "unsubscribe_project":
                project_id = data.get("project_id")
                if project_id:
                    group_name = f"project_{project_id}"
                    await self.channel_layer.group_discard(group_name, self.channel_name)
                    await self.send(text_data=json.dumps({
                        "type": "unsubscription_success",
                        "project_id": project_id
                    }))
        
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "Invalid JSON"
            }))

    async def activity_message(self, event):
        """Handle activity broadcast from channel layer"""
        activity = event["activity"]
        
        # Send activity to WebSocket
        await self.send(text_data=json.dumps({
            "type": "activity",
            "data": activity
        }))
