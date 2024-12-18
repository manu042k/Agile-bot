import userInfoService from "@/services/userInfoService";
import { User } from "@/types/user";
import { useEffect, useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";

const WebSockets = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectInterval = useRef<NodeJS.Timeout | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const MAX_RETRIES = 10; // Maximum reconnection attempts
  const [retryCount, setRetryCount] = useState(0);

  // Initialize WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    socketRef.current = new WebSocket("ws://localhost:8000/ws/chat/");

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
      setRetryCount(0); // Reset retry count on successful connection
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message received:", data);

      setMessages((prevMessages) => {
        console.log("user", user?.id == data.user_id);
        if (user?.id == data.user_id) {
          const updatedMessages = [...prevMessages, data.message];
          // Calculate progress based on the number of messages received
          toast.success(`New message: ${data.message}`);
          return updatedMessages;
        } else {
          return prevMessages;
        }
      });
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket closed");
      if (retryCount < MAX_RETRIES) {
        setRetryCount((prevCount) => prevCount + 1);
        reconnectInterval.current = setTimeout(() => {
          console.log(`Reconnecting... Attempt ${retryCount + 1}`);
          connectWebSocket();
        }, 2000); // Retry every 2 seconds
      } else {
        console.error("Maximum retries reached. Please try again later.");
      }
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      socketRef.current?.close();
    };
  }, [retryCount]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userInfoService.getUserInfo();
        setUser(response);
      } catch (err: any) {}
    };

    fetchUser();

    connectWebSocket();

    return () => {
      // Clean up WebSocket connection
      if (socketRef.current) {
        socketRef.current.close();
      }

      // Clear any pending reconnection attempts
      if (reconnectInterval.current) {
        clearTimeout(reconnectInterval.current);
      }
    };
  }, [connectWebSocket]);

  return <></>;
};

export default WebSockets;
