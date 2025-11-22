"use client";
import { useState } from "react";
import { Bell, CheckCircle, X, MessageSquare, UserPlus, FileText, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: "task_assigned",
    title: "New task assigned",
    message: "You've been assigned to 'Implement user authentication'",
    project: "E-Commerce Platform",
    taskId: 1,
    projectId: 1,
    timestamp: "2 minutes ago",
    read: false,
    icon: CheckCircle,
  },
  {
    id: 2,
    type: "comment",
    title: "New comment",
    message: "John Doe commented on 'Design dashboard UI'",
    project: "AI Analytics Dashboard",
    taskId: 2,
    projectId: 3,
    timestamp: "15 minutes ago",
    read: false,
    icon: MessageSquare,
  },
  {
    id: 3,
    type: "team_added",
    title: "Added to team",
    message: "You've been added to 'Frontend Team'",
    teamId: 1,
    timestamp: "1 hour ago",
    read: false,
    icon: UserPlus,
  },
  {
    id: 4,
    type: "document_uploaded",
    title: "Document uploaded",
    message: "New document 'Project Requirements.pdf' uploaded",
    project: "E-Commerce Platform",
    projectId: 1,
    timestamp: "2 hours ago",
    read: true,
    icon: FileText,
  },
  {
    id: 5,
    type: "task_status",
    title: "Task status changed",
    message: "'Write API documentation' marked as Done",
    project: "Mobile Banking App",
    taskId: 3,
    projectId: 2,
    timestamp: "3 hours ago",
    read: true,
    icon: AlertCircle,
  },
];

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotificationLink = (notification: typeof mockNotifications[0]) => {
    if (notification.taskId && notification.projectId) {
      return `/projects/${notification.projectId}/task/${notification.taskId}`;
    }
    if (notification.projectId) {
      return `/projects/${notification.projectId}`;
    }
    if (notification.teamId) {
      return `/teams/${notification.teamId}`;
    }
    return "#";
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
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <Link
                    key={notification.id}
                    href={getNotificationLink(notification)}
                    onClick={() => markAsRead(notification.id)}
                    className={`block p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        !notification.read ? "bg-blue-100" : "bg-gray-100"
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          !notification.read ? "text-blue-600" : "text-gray-600"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          !notification.read ? "text-gray-900" : "text-gray-700"
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        {notifications.length > 0 && (
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

