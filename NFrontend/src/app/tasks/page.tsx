"use client";
import { useState } from "react";
import { Plus, Search, List, LayoutGrid, CheckSquare, ListTodo, UserCheck, CheckCircle2, FileText, PlayCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import TaskCard from "@/components/projects/TaskCard";
import { Separator } from "@/components/ui/separator";
import ActivityFeed from "@/components/common/ActivityFeed";
import StatCard from "@/components/common/StatCard";
import DetailsCard from "@/components/common/DetailsCard";
import { Task, TaskStatus, TaskPriority, TaskSize, CreatedBy } from "@/types/project";

// Mock tasks data - converted to Task type
const mockTasks: Task[] = [
  { 
    taskid: "1", 
    name: "Implement user authentication", 
    description: "Add OAuth and JWT authentication",
    details: "Implement secure user authentication system",
    Project: "1", 
    assigned_to: [{ id: 1, email: "john@example.com", username: "John Doe", first_name: "John", last_name: "Doe" }], 
    priority: TaskPriority.High, 
    status: TaskStatus.Active, 
    size: TaskSize.Medium,
    tags: ["Backend", "Security"],
    comments: [],
    related_work: [],
    created_by: CreatedBy.USER,
    task_number: "1",
    created_at: "2024-02-10T10:00:00Z",
    updated_at: "2024-02-15T10:00:00Z"
  },
  { 
    taskid: "2", 
    name: "Design dashboard UI", 
    description: "Create modern dashboard interface",
    details: "Design responsive dashboard UI",
    Project: "2", 
    assigned_to: [{ id: 2, email: "jane@example.com", username: "Jane Smith", first_name: "Jane", last_name: "Smith" }], 
    priority: TaskPriority.Normal, 
    status: TaskStatus.Created, 
    size: TaskSize.Large,
    tags: ["Frontend", "UI"],
    comments: [],
    related_work: [],
    created_by: CreatedBy.USER,
    task_number: "2",
    created_at: "2024-02-12T10:00:00Z",
    updated_at: "2024-02-18T10:00:00Z"
  },
  { 
    taskid: "3", 
    name: "Write API documentation", 
    description: "Document all API endpoints",
    details: "Complete API documentation",
    Project: "3", 
    assigned_to: [{ id: 3, email: "mike@example.com", username: "Mike Johnson", first_name: "Mike", last_name: "Johnson" }], 
    priority: TaskPriority.Low, 
    status: TaskStatus.Created, 
    size: TaskSize.Small,
    tags: ["Documentation"],
    comments: [],
    related_work: [],
    created_by: CreatedBy.USER,
    task_number: "3",
    created_at: "2024-02-13T10:00:00Z",
    updated_at: "2024-02-20T10:00:00Z"
  },
  { 
    taskid: "4", 
    name: "Review pull request #234", 
    description: "Code review for authentication PR",
    details: "Review and approve PR",
    Project: "1", 
    assigned_to: [{ id: 4, email: "sarah@example.com", username: "Sarah Wilson", first_name: "Sarah", last_name: "Wilson" }], 
    priority: TaskPriority.High, 
    status: TaskStatus.Created, 
    size: TaskSize.Small,
    tags: ["Code Review"],
    comments: [],
    related_work: [],
    created_by: CreatedBy.USER,
    task_number: "4",
    created_at: "2024-02-11T10:00:00Z",
    updated_at: "2024-02-14T10:00:00Z"
  },
  { 
    taskid: "5", 
    name: "Set up CI/CD pipeline", 
    description: "Configure automated deployment",
    details: "Setup CI/CD with GitHub Actions",
    Project: "2", 
    assigned_to: [{ id: 5, email: "alex@example.com", username: "Alex Brown", first_name: "Alex", last_name: "Brown" }], 
    priority: TaskPriority.Normal, 
    status: TaskStatus.Active, 
    size: TaskSize.Large,
    tags: ["DevOps"],
    comments: [],
    related_work: [],
    created_by: CreatedBy.USER,
    task_number: "5",
    created_at: "2024-02-14T10:00:00Z",
    updated_at: "2024-02-16T10:00:00Z"
  },
  { 
    taskid: "6", 
    name: "Database schema design", 
    description: "Design database structure",
    details: "Create optimized database schema",
    Project: "3", 
    assigned_to: [{ id: 6, email: "chris@example.com", username: "Chris Lee", first_name: "Chris", last_name: "Lee" }], 
    priority: TaskPriority.High, 
    status: TaskStatus.Completed, 
    size: TaskSize.Medium,
    tags: ["Database"],
    comments: [],
    related_work: [],
    created_by: CreatedBy.USER,
    task_number: "6",
    created_at: "2024-02-09T10:00:00Z",
    updated_at: "2024-02-17T10:00:00Z"
  },
];

const TasksPage = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock current user for filtering
  const currentUserEmail = "john@example.com";

  const filteredTasks = mockTasks.filter(task => {
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
                      {Math.round((mockTasks.filter(t => t.status === TaskStatus.Completed).length / mockTasks.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full transition-all"
                      style={{ width: `${Math.round((mockTasks.filter(t => t.status === TaskStatus.Completed).length / mockTasks.length) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <StatCard
                    icon={FileText}
                    value={mockTasks.length}
                    label="Total Tasks"
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                    className="p-0"
                  />
                  <StatCard
                    icon={CheckCircle2}
                    value={mockTasks.filter(t => t.status === TaskStatus.Completed).length}
                    label="Completed"
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                    className="p-0"
                  />
                  <StatCard
                    icon={PlayCircle}
                    value={mockTasks.filter(t => t.status === TaskStatus.Active).length}
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
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-sm text-gray-500">
                      {searchQuery || filterStatus !== "all" 
                        ? "Try adjusting your filters" 
                        : "No tasks available"}
                    </p>
                  </div>
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
                  value: mockTasks.length,
                  iconBgColor: "bg-blue-100",
                  iconColor: "text-blue-600",
                },
                {
                  icon: CheckCircle2,
                  label: "Completed",
                  value: mockTasks.filter(t => t.status === TaskStatus.Completed).length,
                  iconBgColor: "bg-green-100",
                  iconColor: "text-green-600",
                },
                {
                  icon: PlayCircle,
                  label: "In Progress",
                  value: mockTasks.filter(t => t.status === TaskStatus.Active).length,
                  iconBgColor: "bg-orange-100",
                  iconColor: "text-orange-600",
                },
                {
                  icon: FileText,
                  label: "Backlog",
                  value: mockTasks.filter(t => t.status === TaskStatus.Backlog).length,
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
