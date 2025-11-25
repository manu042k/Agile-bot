import { Activity } from "@/types/activity";

type ActivityCallback = (activity: Activity) => void;

class ActivityWebSocketService {
  private ws: WebSocket | null = null;
  private callbacks: ActivityCallback[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Use environment variable or default to localhost
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
      this.ws = new WebSocket(`${wsUrl}/ws/activities/`);

      this.ws.onopen = () => {
        console.log("Activity WebSocket connected");
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "activity" && data.data) {
            // Notify all subscribers
            this.callbacks.forEach((callback) => callback(data.data));
          }
        } catch (error) {
          console.error("Error parsing activity message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("Activity WebSocket error:", error);
      };

      this.ws.onclose = () => {
        console.log("Activity WebSocket closed");
        this.ws = null;

        // Attempt to reconnect if not intentionally closed
        if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          
          this.reconnectTimeout = setTimeout(() => {
            this.connect();
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
    }
  }

  /**
   * Subscribe to activity updates
   */
  public subscribe(callback: ActivityCallback): () => void {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Subscribe to a specific project's activities
   */
  public subscribeToProject(projectId: number) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "subscribe_project",
          project_id: projectId,
        })
      );
    }
  }

  /**
   * Unsubscribe from a specific project's activities
   */
  public unsubscribeFromProject(projectId: number) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "unsubscribe_project",
          project_id: projectId,
        })
      );
    }
  }

  /**
   * Close the WebSocket connection
   */
  public close() {
    this.isIntentionallyClosed = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.callbacks = [];
  }

  /**
   * Get connection status
   */
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let activityWebSocketService: ActivityWebSocketService | null = null;

export const getActivityWebSocket = (): ActivityWebSocketService => {
  if (!activityWebSocketService) {
    activityWebSocketService = new ActivityWebSocketService();
  }
  return activityWebSocketService;
};

export default getActivityWebSocket;

