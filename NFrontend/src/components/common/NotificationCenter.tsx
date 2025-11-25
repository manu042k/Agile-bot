"use client";
import { useState, useMemo } from "react";
import {
  Bell,
  CheckCircle,
  X,
  MessageSquare,
  UserPlus,
  FileText,
  AlertCircle,
  Folder,
  Upload,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import useActivities from "@/hooks/useActivities";

export default function NotificationCenter() {
  const { activities, loading } = useActivities({ limit: 20 });
  const [readIds, setReadIds] = useState<Set<number>>(new Set());

  // Get unread count (activities not in readIds)
  const unreadCount = activities.filter((a) => !readIds.has(a.id)).length;

  const markAsRead = (id: number) => {
    setReadIds((prev) => new Set(Array.from(prev).concat(id)));
  };

  const markAllAsRead = () => {
    setReadIds(new Set(activities.map((a) => a.id)));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_completed":
        return CheckCircle;
      case "comment_added":
        return MessageSquare;
      case "task_created":
      case "task_updated":
        return FileText;
      case "member_added":
      case "member_removed":
        return UserPlus;
      case "task_assigned":
        return UserIcon;
      case "document_uploaded":
        return Upload;
      case "project_created":
      case "project_updated":
        return Folder;
      default:
        return Bell;
    }
  };

  const getActivityTitle = (type: string) => {
    switch (type) {
      case "task_completed":
        return "Task completed";
      case "comment_added":
        return "New comment";
      case "task_created":
        return "Task created";
      case "task_updated":
        return "Task updated";
      case "task_assigned":
        return "Task assigned";
      case "member_added":
        return "Member added";
      case "member_removed":
        return "Member removed";
      case "document_uploaded":
        return "Document uploaded";
      case "project_created":
        return "Project created";
      case "project_updated":
        return "Project updated";
      default:
        return "Activity";
    }
  };

  const getNotificationLink = (activity: (typeof activities)[0]) => {
    if (activity.task && activity.project) {
      return `/projects/${activity.project}/task/${activity.task}`;
    }
    if (activity.project) {
      return `/projects/${activity.project}`;
    }
    return "/activity";
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-gray-900 rounded-full" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-3 text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.activity_type);
                const isUnread = !readIds.has(activity.id);
                return (
                  <Link
                    key={activity.id}
                    href={getNotificationLink(activity)}
                    onClick={() => markAsRead(activity.id)}
                    className={`block p-4 hover:bg-gray-50 transition-colors ${
                      isUnread ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isUnread ? "bg-blue-100" : "bg-gray-100"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            isUnread ? "text-blue-600" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            isUnread ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {getActivityTitle(activity.activity_type)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                        {activity.project_name && (
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.project_name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(activity.created_at)}
                        </p>
                      </div>
                      {isUnread && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        {activities.length > 0 && (
          <div className="p-3 border-t border-gray-200 text-center">
            <Link
              href="/activity"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              View all activity
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
