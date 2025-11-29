"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, Search, User, CheckCircle2, MessageSquare, FileText, Users, Calendar, Activity, UserCircle, FolderOpen, Loader2, Folder } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Separator } from "@/components/ui/separator";
import StatCard from "@/components/common/StatCard";
import DetailsCard from "@/components/common/DetailsCard";
import useActivities from "@/hooks/useActivities";
import { useUser } from "@/hooks/useUser";
import { Activity as ActivityType } from "@/types/activity";

const ActivityPage = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "all";
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { user: currentUser } = useUser();
  
  // Fetch all activities with real API
  const { activities, loading, error } = useActivities({ limit: 100 });

  // Filter activities based on search, filter type, and tab
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = 
        activity.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.target_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterType === "all" || activity.activity_type === filterType;
      
      // Apply tab filters
      let matchesTab = true;
      if (tab === "my-activity") {
        // Show only activities by the current user
        matchesTab = activity.user_email === currentUser?.email;
      } else if (tab === "projects") {
        // Show only project and task related activities
        matchesTab = activity.activity_type.includes("project") || 
                     activity.activity_type.includes("task") ||
                     activity.activity_type.includes("document");
      }
      
      return matchesSearch && matchesFilter && matchesTab;
    });
  }, [activities, searchQuery, filterType, tab, currentUser]);

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

  const activityTypes = useMemo(() => new Set(activities.map(a => a.activity_type)), [activities]);
  const activeUsers = useMemo(() => new Set(activities.map(a => a.user_email)), [activities]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Activity Feed"
        description="Track all activities across your projects and teams"
        icon={Activity}
        tabs={[
          { icon: Activity, label: "All Activity", href: "/activity" },
          { icon: UserCircle, label: "My Activity", href: "/activity?tab=my-activity" },
          { icon: FolderOpen, label: "Projects", href: "/activity?tab=projects" },
        ]}
        searchPlaceholder="Search activities..."
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        filterOptions={[
          { value: "all", label: "All Activities" },
          { value: "task_completed", label: "Task Completed" },
          { value: "comment_added", label: "Comments" },
          { value: "task_created", label: "Task Created" },
          { value: "task_updated", label: "Task Updated" },
          { value: "member_added", label: "Member Added" },
          { value: "task_assigned", label: "Task Assigned" },
          { value: "project_created", label: "Project Created" },
          { value: "project_updated", label: "Project Updated" },
          { value: "document_uploaded", label: "Document Uploaded" },
        ]}
        filterValue={filterType}
        onFilterChange={(e) => setFilterType(e.target.value)}
      />

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Overview */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">Activity Overview</h2>
              <Separator className="my-4" />
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <StatCard
                    icon={Activity}
                    value={activities.length}
                    label="Total Activities"
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                    className="p-0 border-0 shadow-none bg-transparent"
                  />
                  <StatCard
                    icon={FileText}
                    value={activityTypes.size}
                    label="Activity Types"
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                    className="p-0 border-0 shadow-none bg-transparent"
                  />
                  <StatCard
                    icon={Users}
                    value={activeUsers.size}
                    label="Active Users"
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                    className="p-0 border-0 shadow-none bg-transparent"
                  />
                </div>
              )}
            </div>


            {/* Activity Timeline */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">Activity Feed</h2>
              <Separator className="my-4" />
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              ) : filteredActivities.length > 0 ? (
                <div className="space-y-4">
                  {filteredActivities.map((activity) => {
                    const Icon = getActivityIcon(activity.activity_type);
                    return (
                      <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.activity_type)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-semibold">{activity.user_email}</span> {activity.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            {activity.project_name && (
                              <span className="flex items-center gap-1">
                                <Folder className="h-3 w-3" />
                                {activity.project_name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatTimeAgo(activity.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities found</h3>
                  <p className="text-sm text-gray-500">Try adjusting your filters or perform some actions to generate activities</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Details */}
            {!loading && (
              <DetailsCard
                title="Activity Details"
                items={[
                  {
                    icon: Activity,
                    label: "Total Activities",
                    value: activities.length,
                    iconBgColor: "bg-blue-100",
                    iconColor: "text-blue-600",
                  },
                  {
                    icon: FileText,
                    label: "Activity Types",
                    value: activityTypes.size,
                    iconBgColor: "bg-purple-100",
                    iconColor: "text-purple-600",
                  },
                  {
                    icon: Users,
                    label: "Active Users",
                    value: activeUsers.size,
                    iconBgColor: "bg-green-100",
                    iconColor: "text-green-600",
                  },
                  {
                    icon: Search,
                    label: "Filtered Results",
                    value: filteredActivities.length,
                    iconBgColor: "bg-orange-100",
                    iconColor: "text-orange-600",
                  },
                ]}
              />
            )}

            {/* Recent Activity */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900">Quick Stats</h3>
              <Separator className="my-4" />
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 3).map((activity) => {
                    const Icon = getActivityIcon(activity.activity_type);
                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.activity_type)}`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-900 truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatTimeAgo(activity.created_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                  {activities.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4">No activities yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;

