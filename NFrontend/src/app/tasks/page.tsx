"use client";
import { useState } from "react";
import { Plus, Search, Filter, Calendar, User, Flag, MoreVertical, List, LayoutGrid, CheckSquare, ListTodo, UserCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useParams, useSearchParams } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import TaskCreateComponent from "@/components/projects/TaskCreateComponent";
import { getPriorityClass } from "@/lib/colorUtils";
import { Separator } from "@/components/ui/separator";

// Mock tasks data
const mockTasks = [
  { id: 1, title: "Implement user authentication", project: "E-Commerce Platform", assignee: "John Doe", dueDate: "2024-02-15", priority: "high", status: "in_progress", tags: ["Backend", "Security"] },
  { id: 2, title: "Design dashboard UI", project: "Analytics Dashboard", assignee: "Jane Smith", dueDate: "2024-02-18", priority: "medium", status: "todo", tags: ["Frontend", "UI"] },
  { id: 3, title: "Write API documentation", project: "Mobile Banking App", assignee: "Mike Johnson", dueDate: "2024-02-20", priority: "low", status: "todo", tags: ["Documentation"] },
  { id: 4, title: "Review pull request #234", project: "E-Commerce Platform", assignee: "Sarah Wilson", dueDate: "2024-02-14", priority: "high", status: "todo", tags: ["Code Review"] },
  { id: 5, title: "Set up CI/CD pipeline", project: "AI Analytics Dashboard", assignee: "Alex Brown", dueDate: "2024-02-16", priority: "medium", status: "in_progress", tags: ["DevOps"] },
  { id: 6, title: "Database schema design", project: "Mobile Banking App", assignee: "Chris Lee", dueDate: "2024-02-17", priority: "high", status: "done", tags: ["Database"] },
];

const TasksPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  // For global tasks, use first project or allow selection
  const defaultProjectId = "1";

  // Mock current user for filtering
  const currentUser = "John Doe";

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || task.status === filterStatus;
    
    // Apply tab filters
    let matchesTab = true;
    if (tab === "my-tasks") {
      matchesTab = task.assignee === currentUser;
    } else if (tab === "assigned") {
      matchesTab = task.assignee !== null && task.assignee !== "";
    } else if (tab === "completed") {
      matchesTab = task.status === "done";
    }
    
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "pm-status-done";
      case "in_progress": return "pm-status-progress";
      case "todo": return "pm-status-todo";
      default: return "pm-status-backlog";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Tasks"
        description="Manage and track all your tasks across projects"
        icon={CheckSquare}
        tabs={[
          { icon: CheckSquare, label: "Tasks", href: "/tasks" },
          { icon: ListTodo, label: "My Tasks", href: "/tasks?tab=my-tasks" },
          { icon: UserCheck, label: "Assigned", href: "/tasks?tab=assigned" },
          { icon: CheckCircle2, label: "Completed", href: "/tasks?tab=completed" },
        ]}
      />

      <div className="px-6 py-8">
        {/* Filters and Actions */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pm-input !pl-10 pr-3 w-full"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pm-input min-w-[140px] flex-shrink-0"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <button className="pm-button-secondary whitespace-nowrap flex-shrink-0 inline-flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("board")}
                  className={`p-2 rounded transition-colors ${viewMode === "board" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                  title="Board view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
              <button className="pm-button-primary inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Task
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button className="pm-card p-5 text-left group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <Plus className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Create Task</h3>
                    <p className="text-xs text-gray-500">New task</p>
                  </div>
                </div>
              </button>

              <button className="pm-card p-5 text-left group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <Filter className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Filter Tasks</h3>
                    <p className="text-xs text-gray-500">Advanced filters</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Tasks Overview */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">Tasks Overview</h2>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-medium text-gray-900">
                      {Math.round((mockTasks.filter(t => t.status === "done").length / mockTasks.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full transition-all"
                      style={{ width: `${Math.round((mockTasks.filter(t => t.status === "done").length / mockTasks.length) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{mockTasks.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{mockTasks.filter(t => t.status === "done").length}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{mockTasks.filter(t => t.status === "in_progress").length}</p>
                    <p className="text-xs text-gray-500 mt-1">In Progress</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
              <Separator className="my-4" />
              {viewMode === "list" ? (
                filteredTasks.length > 0 ? (
                  <div className="space-y-3">
                    {filteredTasks.map((task) => {
                      // Extract project ID from task (assuming task has projectId or we can derive it)
                      const projectId = task.id % 3 + 1; // Mock: derive from task ID for demo
                      return (
                        <Link key={task.id} href={`/projects/${projectId}/task/${task.id}`}>
                          <div className="pm-card p-5 hover:shadow-md transition-all cursor-pointer">
                            <div className="flex items-start gap-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`pm-status-dot ${getStatusColor(task.status)} flex-shrink-0 mt-1.5`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h3 className="font-medium text-gray-900 text-base">{task.title}</h3>
                                    <span className={`pm-badge inline-flex items-center gap-1 ${getPriorityClass(task.priority)} flex-shrink-0`}>
                                      <Flag className="h-3 w-3" />
                                      {task.priority}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                                    <Link 
                                      href={`/projects/${projectId}`} 
                                      className="hover:text-gray-900 flex items-center gap-1.5"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                      {task.project}
                                    </Link>
                                    <span className="flex items-center gap-1.5">
                                      <User className="h-3.5 w-3.5 flex-shrink-0" />
                                      {task.assignee}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                      {task.dueDate}
                                    </span>
                                  </div>
                                  {task.tags && task.tags.length > 0 && (
                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                      {task.tags.map((tag, idx) => (
                                        <span key={idx} className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button 
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                                title="More options"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <MoreVertical className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      {searchQuery || filterStatus !== "all" 
                        ? "Try adjusting your filters" 
                        : "Get started by creating your first task"}
                    </p>
                    {!searchQuery && filterStatus === "all" && (
                      <button className="pm-button-primary inline-flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create Task
                      </button>
                    )}
                  </div>
                )
              ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["todo", "in_progress", "review", "done"].map((status) => {
              const statusTasks = filteredTasks.filter(t => {
                if (status === "review") return false;
                return t.status === status;
              });
              return (
                <div key={status} className="flex flex-col">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`pm-status-dot ${
                          status === "done" ? "pm-status-done" :
                          status === "in_progress" ? "pm-status-progress" :
                          status === "todo" ? "pm-status-todo" :
                          "pm-status-backlog"
                        }`} />
                        <h3 className="font-semibold text-gray-900 capitalize text-sm">{status.replace("_", " ")}</h3>
                      </div>
                      <span className="pm-badge">{statusTasks.length}</span>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1 min-h-[200px]">
                    {statusTasks.map((task) => (
                      <div key={task.id} className="pm-card p-4 cursor-pointer hover:shadow-md transition-all">
                        <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">{task.title}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                          <span className="truncate flex-1 min-w-0">{task.project}</span>
                          <span className={`pm-badge ml-2 flex-shrink-0 ${getPriorityClass(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                    <button className="pm-card p-3 text-center text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all border-dashed">
                      <Plus className="h-4 w-4 mx-auto mb-1" />
                      Add task
                    </button>
                  </div>
                </div>
              );
            })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Details */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900">Task Details</h3>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Status</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">To Do</span>
                      <span className="text-sm font-medium text-gray-900">{mockTasks.filter(t => t.status === "todo").length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">In Progress</span>
                      <span className="text-sm font-medium text-gray-900">{mockTasks.filter(t => t.status === "in_progress").length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Done</span>
                      <span className="text-sm font-medium text-gray-900">{mockTasks.filter(t => t.status === "done").length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              <Separator className="my-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-3 w-3 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900">
                        Task updated
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

export default TasksPage;
