"use client";
import { useState, useEffect } from "react";
import { Plus, Search, List, LayoutGrid, CheckSquare, ListTodo, UserCheck, CheckCircle2, FileText, PlayCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import TaskCard from "@/components/projects/TaskCard";
import { Separator } from "@/components/ui/separator";
import ActivityFeed from "@/components/common/ActivityFeed";
import StatCard from "@/components/common/StatCard";
import DetailsCard from "@/components/common/DetailsCard";
import EmptyState from "@/components/common/EmptyState";
import { Task, TaskStatus } from "@/types/project";

const TasksPage = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const userEmail = localStorage.getItem("user_email");
        setCurrentUserEmail(userEmail || "");

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || task.status === filterStatus;
    
    // Apply tab filters
    let matchesTab = true;
    if (tab === "my-tasks") {
      matchesTab = task.assigned_to.some((assignee: any) => assignee.email === currentUserEmail);
    } else if (tab === "assigned") {
      matchesTab = task.assigned_to && task.assigned_to.length > 0;
    } else if (tab === "done") {
      matchesTab = task.status === TaskStatus.Completed;
    }
    
    return matchesSearch && matchesFilter && matchesTab;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Tasks"
        description="Manage and track all your tasks across projects"
        icon={CheckSquare}
        tabs={[
          { icon: CheckSquare, label: "All Tasks", href: "/tasks" },
          { icon: ListTodo, label: "My Tasks", href: "/tasks?tab=my-tasks" },
          { icon: UserCheck, label: "Assigned", href: "/tasks?tab=assigned" },
          { icon: CheckCircle2, label: "Done", href: "/tasks?tab=done" },
        ]}
        searchPlaceholder="Search tasks..."
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        viewModeButtons={
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`p-2 rounded transition-colors ${viewMode === "board" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              title="Board view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="px-6 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tasks Overview */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">Tasks Overview</h2>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-medium text-gray-900">
                      {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === TaskStatus.Completed).length / tasks.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full transition-all"
                      style={{ width: `${tasks.length > 0 ? Math.round((tasks.filter(t => t.status === TaskStatus.Completed).length / tasks.length) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <StatCard
                    icon={FileText}
                    value={tasks.length}
                    label="Total Tasks"
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                    className="p-0"
                  />
                  <StatCard
                    icon={CheckCircle2}
                    value={tasks.filter(t => t.status === TaskStatus.Completed).length}
                    label="Completed"
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                    className="p-0"
                  />
                  <StatCard
                    icon={PlayCircle}
                    value={tasks.filter(t => t.status === TaskStatus.Active).length}
                    label="In Progress"
                    iconBgColor="bg-orange-100"
                    iconColor="text-orange-600"
                    className="p-0"
                  />
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
              <Separator className="my-4" />
              {viewMode === "list" ? (
                filteredTasks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTasks.map((task) => (
                      <TaskCard
                        key={task.taskid}
                        task={task}
                        projectId={task.Project}
                        onUpdate={(updatedTask) => {
                          // Handle task update if needed
                          console.log("Task updated:", updatedTask);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={searchQuery || filterStatus !== "all" ? Search : CheckSquare}
                    title="No tasks found"
                    description={
                      searchQuery || filterStatus !== "all"
                        ? "Try adjusting your filters or search query"
                        : "No tasks available yet"
                    }
                  />
                )
              ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: TaskStatus.Backlog, label: "Backlog", dotClass: "pm-status-backlog" },
              { key: TaskStatus.Created, label: "Created", dotClass: "pm-status-todo" },
              { key: TaskStatus.Active, label: "In Progress", dotClass: "pm-status-progress" },
              { key: TaskStatus.Completed, label: "Done", dotClass: "pm-status-done" }
            ].map((statusConfig) => {
              const statusTasks = filteredTasks.filter(t => t.status === statusConfig.key);
              return (
                <div key={statusConfig.key} className="flex flex-col">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`pm-status-dot ${statusConfig.dotClass}`} />
                        <h3 className="font-semibold text-gray-900 text-sm">{statusConfig.label}</h3>
                      </div>
                      <span className="pm-badge">{statusTasks.length}</span>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1 min-h-[200px]">
                    {statusTasks.map((task) => (
                      <TaskCard
                        key={task.taskid}
                        task={task}
                        projectId={task.Project}
                        compact={true}
                        onUpdate={(updatedTask) => {
                          console.log("Task updated:", updatedTask);
                        }}
                      />
                    ))}
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
            <DetailsCard
              title="Task Details"
              items={[
                {
                  icon: FileText,
                  label: "Total Tasks",
                  value: tasks.length,
                  iconBgColor: "bg-blue-100",
                  iconColor: "text-blue-600",
                },
                {
                  icon: CheckCircle2,
                  label: "Completed",
                  value: tasks.filter(t => t.status === TaskStatus.Completed).length,
                  iconBgColor: "bg-green-100",
                  iconColor: "text-green-600",
                },
                {
                  icon: PlayCircle,
                  label: "In Progress",
                  value: tasks.filter(t => t.status === TaskStatus.Active).length,
                  iconBgColor: "bg-orange-100",
                  iconColor: "text-orange-600",
                },
                {
                  icon: FileText,
                  label: "Backlog",
                  value: tasks.filter(t => t.status === TaskStatus.Backlog).length,
                  iconBgColor: "bg-gray-100",
                  iconColor: "text-gray-600",
                },
              ]}
            />

            {/* Recent Activity */}
            <ActivityFeed limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
