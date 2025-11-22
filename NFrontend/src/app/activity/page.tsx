"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, Search, User, CheckCircle2, MessageSquare, FileText, Users, Calendar, Activity, UserCircle, FolderOpen } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";

// Mock activity data
const mockActivities = [
  { id: 1, type: "task_completed", user: "John Doe", action: "completed task", target: "Implement user authentication", project: "E-Commerce Platform", timestamp: "2 hours ago", icon: CheckCircle2 },
  { id: 2, type: "comment", user: "Jane Smith", action: "commented on", target: "Design dashboard UI", project: "Analytics Dashboard", timestamp: "3 hours ago", icon: MessageSquare },
  { id: 3, type: "task_created", user: "Mike Johnson", action: "created task", target: "Set up shopping cart", project: "E-Commerce Platform", timestamp: "5 hours ago", icon: FileText },
  { id: 4, type: "member_added", user: "Sarah Wilson", action: "added", target: "Alex Brown", project: "Mobile Banking App", timestamp: "1 day ago", icon: Users },
  { id: 5, type: "task_assigned", user: "John Doe", action: "assigned task", target: "Write API documentation", project: "Mobile Banking App", timestamp: "1 day ago", icon: User },
  { id: 6, type: "project_updated", user: "Jane Smith", action: "updated project", target: "AI Analytics Dashboard", project: "AI Analytics Dashboard", timestamp: "2 days ago", icon: FileText },
];

const ActivityPage = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "all";
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock current user
  const currentUser = "John Doe";

  const filteredActivities = mockActivities.filter(activity => {
    const matchesSearch = activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || activity.type === filterType;
    
    // Apply tab filters
    let matchesTab = true;
    if (tab === "my-activity") {
      matchesTab = activity.user === currentUser;
    } else if (tab === "projects") {
      matchesTab = activity.type.includes("project") || activity.type.includes("task");
    }
    
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getActivityColor = (type: string) => {
    switch (type) {
      case "task_completed":
        return "pm-status-badge-done";
      case "comment":
        return "bg-blue-100 text-blue-700";
      case "task_created":
        return "pm-status-badge-todo";
      case "member_added":
        return "pm-priority-medium";
      case "task_assigned":
        return "pm-status-badge-progress";
      default:
        return "pm-status-badge-backlog";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Activity Feed"
        description="Track all activities across your projects and teams"
        icon={Activity}
        tabs={[
          { icon: Activity, label: "Activity", href: "/activity" },
          { icon: UserCircle, label: "My Activity", href: "/activity?tab=my-activity" },
          { icon: FolderOpen, label: "Projects", href: "/activity?tab=projects" },
        ]}
      />

      <div className="px-6 py-8">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pm-input !pl-10 pr-3 w-full"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pm-input min-w-[180px] flex-shrink-0"
            >
              <option value="all">All Activities</option>
              <option value="task_completed">Task Completed</option>
              <option value="comment">Comments</option>
              <option value="task_created">Task Created</option>
              <option value="member_added">Member Added</option>
              <option value="task_assigned">Task Assigned</option>
              <option value="project_updated">Project Updated</option>
            </select>
            <button className="pm-button-secondary whitespace-nowrap flex-shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button className="pm-card p-5 text-left group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <Filter className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Filter Activity</h3>
                    <p className="text-xs text-gray-500">Advanced filters</p>
                  </div>
                </div>
              </button>

              <button className="pm-card p-5 text-left group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <Search className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Search Activity</h3>
                    <p className="text-xs text-gray-500">Find activities</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Activity Overview */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Total Activities</span>
                    <span className="font-medium text-gray-900">{mockActivities.length}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full transition-all"
                      style={{ width: `${(mockActivities.length / 20) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{mockActivities.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Activities</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{new Set(mockActivities.map(a => a.type)).size}</p>
                    <p className="text-xs text-gray-500 mt-1">Activity Types</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{new Set(mockActivities.map(a => a.user)).size}</p>
                    <p className="text-xs text-gray-500 mt-1">Active Users</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pm-input !pl-10 pr-3 w-full"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pm-input min-w-[180px] flex-shrink-0"
          >
            <option value="all">All Activities</option>
            <option value="task_completed">Task Completed</option>
            <option value="comment">Comments</option>
            <option value="task_created">Task Created</option>
            <option value="member_added">Member Added</option>
            <option value="task_assigned">Task Assigned</option>
            <option value="project_updated">Project Updated</option>
          </select>
          <button className="pm-button-secondary whitespace-nowrap flex-shrink-0">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>

            {/* Activity Timeline */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Feed</h2>
              {filteredActivities.length > 0 ? (
                <div className="space-y-4">
                  {filteredActivities.map((activity, idx) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-semibold">{activity.user}</span> {activity.action}{" "}
                            <span className="font-medium">{activity.target}</span>
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {activity.project}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {activity.timestamp}
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
                  <p className="text-sm text-gray-500">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Details */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Activity Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Total Activities</p>
                  <p className="text-sm font-medium text-gray-900">{mockActivities.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Activity Types</p>
                  <p className="text-sm font-medium text-gray-900">{new Set(mockActivities.map(a => a.type)).size}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Active Users</p>
                  <p className="text-sm font-medium text-gray-900">{new Set(mockActivities.map(a => a.user)).size}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-3 w-3 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900">
                        Activity logged
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{i} hour{i > 1 ? 's' : ''} ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;

