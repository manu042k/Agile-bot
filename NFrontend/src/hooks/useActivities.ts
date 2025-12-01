import { useState, useEffect, useCallback } from "react";
import { Activity } from "@/types/activity";
import { getActivityWebSocket } from "@/services/activityWebSocket";
import api from "@/interceptor/api";

interface UseActivitiesOptions {
  projectId?: number;  // Numeric ID for WebSocket filtering
  projectUuid?: string;  // UUID for API calls
  autoConnect?: boolean;
  limit?: number;
  skipInitialFetch?: boolean;
}

export const useActivities = (options: UseActivitiesOptions = {}) => {
  const { projectId, projectUuid, autoConnect = true, limit = 10, skipInitialFetch = false } = options;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(!skipInitialFetch);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial activities
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let url = "/api/project-management/activities/recent/";
      
      // Use projectUuid if provided, otherwise fall back to projectId (for backward compatibility)
      if (projectUuid) {
        url = `/api/project-management/projects/${projectUuid}/activities/?page_size=${limit}`;
      } else if (projectId) {
        // Legacy: numeric ID - this won't work with current backend
        console.warn('useActivities: projectId (numeric) is deprecated, use projectUuid instead');
        url = `/api/project-management/projects/${projectId}/activities/?page_size=${limit}`;
      }

      const response = await api.get(url);
      
      // Handle paginated response
      if (response.data.results) {
        setActivities(response.data.results);
      } else {
        setActivities(response.data);
      }
    } catch (err: any) {
      console.error("Error fetching activities:", err);
      setError(err.message || "Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  }, [projectId, projectUuid, limit]);

  // Add new activity to the list
  const addActivity = useCallback((newActivity: Activity) => {
    setActivities((prev) => {
      // Prevent duplicates
      if (prev.some((a) => a.id === newActivity.id)) {
        return prev;
      }
      
      // Add to beginning and limit the list
      return [newActivity, ...prev].slice(0, limit);
    });
  }, [limit]);

  // Subscribe to WebSocket updates
  useEffect(() => {
    if (!autoConnect) return;

    const ws = getActivityWebSocket();
    
    // Subscribe to activity updates
    const unsubscribe = ws.subscribe((activity: Activity) => {
      // Filter by project if projectId is specified
      if (projectId && activity.project !== projectId) {
        return;
      }
      
      addActivity(activity);
    });

    // Subscribe to project-specific channel if projectId is provided
    if (projectId) {
      ws.subscribeToProject(projectId);
    }

    return () => {
      unsubscribe();
      if (projectId) {
        ws.unsubscribeFromProject(projectId);
      }
    };
  }, [autoConnect, projectId, addActivity]);

  // Fetch initial activities on mount
  useEffect(() => {
    if (!skipInitialFetch) {
      fetchActivities();
    }
  }, [fetchActivities, skipInitialFetch]);

  return {
    activities,
    loading,
    error,
    refresh: fetchActivities,
    addActivity,
  };
};

export default useActivities;

