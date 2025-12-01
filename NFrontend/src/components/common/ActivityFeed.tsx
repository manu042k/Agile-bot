"use client";

import React from "react";
import {
  CheckCircle2,
  MessageSquare,
  FileText,
  Users,
  User,
  Upload,
  Folder,
  Calendar,
  Loader2,
} from "lucide-react";
import { Activity, ActivityType } from "@/types/activity";
import { Separator } from "@/components/ui/separator";
import useActivities from "@/hooks/useActivities";

interface ActivityFeedProps {
  projectId?: number;  // Numeric ID for WebSocket filtering
  projectUuid?: string;  // UUID for API calls
  limit?: number;
  showHeader?: boolean;
  className?: string;
  activities?: Activity[];
  loading?: boolean;
  error?: string | null;
  compact?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  projectId,
  projectUuid,
  limit = 10,
  showHeader = true,
  className = "",
  activities: providedActivities,
  loading: providedLoading,
  error: providedError,
  compact = false,
}) => {
  // Only use hook if activities are not provided
  const hookResult = useActivities({ 
    projectId,
    projectUuid,
    limit, 
    autoConnect: providedActivities === undefined,
    skipInitialFetch: providedActivities !== undefined
  });
  
  // Use provided values if available, otherwise use hook results
  const activities = providedActivities ?? hookResult.activities;
  const loading = providedLoading !== undefined ? providedLoading : hookResult.loading;
  const error = providedError !== undefined ? providedError : hookResult.error;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_completed":
        return CheckCircle2;
      case "comment_added":
        return MessageSquare;
      case "task_created":
      case "task_updated":
        return FileText;
      case "member_added":
      case "member_removed":
        return Users;
      case "task_assigned":
        return User;
      case "document_uploaded":
        return Upload;
      case "project_created":
      case "project_updated":
        return Folder;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "task_completed":
        return "pm-status-badge-done";
      case "comment_added":
        return "bg-blue-100 text-blue-700";
      case "task_created":
        return "pm-status-badge-todo";
      case "task_updated":
        return "pm-status-badge-progress";
      case "member_added":
        return "pm-priority-medium";
      case "member_removed":
        return "bg-red-100 text-red-700";
      case "task_assigned":
        return "pm-status-badge-progress";
      case "document_uploaded":
        return "bg-purple-100 text-purple-700";
      case "project_created":
      case "project_updated":
        return "bg-indigo-100 text-indigo-700";
      default:
        return "pm-status-badge-backlog";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  const paddingClass = compact ? "p-5" : "p-5";

  if (loading) {
    return (
      <div className={`pm-card ${paddingClass} ${className}`}>
        {showHeader && (
          <>
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <Separator className="my-4" />
          </>
        )}
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`pm-card ${paddingClass} ${className}`}>
        {showHeader && (
          <>
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <Separator className="my-4" />
          </>
        )}
        <div className="text-center py-8">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={`pm-card ${paddingClass} ${className}`}>
        {showHeader && (
          <>
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <Separator className="my-4" />
          </>
        )}
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`pm-card ${paddingClass} ${className}`}>
      {showHeader && (
        <>
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          <Separator className="my-4" />
        </>
      )}
      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.activity_type);
          const colorClass = getActivityColor(activity.activity_type);

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-900">
                  <span className="font-medium">{activity.user_email}</span>{" "}
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {activity.project_name && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Folder className="h-3 w-3" />
                      {activity.project_name}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatTimeAgo(activity.created_at)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
