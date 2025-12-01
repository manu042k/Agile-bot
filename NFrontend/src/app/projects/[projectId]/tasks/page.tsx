"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Plus,
  Search,
  Calendar,
  User,
  Flag,
  List,
  LayoutGrid,
  ArrowRight,
  Loader2,
  FileText,
  ListTodo,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import ProjectHeader from "@/components/projects/ProjectHeader";
import TaskCreateComponent from "@/components/projects/TaskCreateComponent";
import taskService from "@/services/taskService";
import StatCard from "@/components/common/StatCard";
import CreateCard from "@/components/common/CreateCard";
import { Task, TaskStatus, TaskPriority } from "@/types/project";
import {
  getStatusLabel,
  getStatusDotClass,
  getStatusBadgeClass,
  normalizeStatus,
  isStatusEqual,
} from "@/lib/statusUtils";
import TaskCard from "@/components/projects/TaskCard";
import EmptyState from "@/components/common/EmptyState";
import toast from "react-hot-toast";

const ProjectTasksPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const [viewMode, setViewMode] = useState<"list" | "board">("board");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await taskService.getTasks(projectId);
      setTasks(fetchedTasks);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleTaskCreated = () => {
    setDialogOpen(false);
    fetchTasks();
    toast.success("Task created successfully");
  };

  const handleTaskDeleted = (taskId: string) => {
    // Remove the task from the local state
    setTasks((prevTasks) => prevTasks.filter((task) => task.taskid !== taskId));
  };

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery && filterStatus === "all") return true;

    // Search matching
    const searchLower = searchQuery.toLowerCase();
    let matchesSearch = true;

    if (searchQuery) {
      const assigneeNames = Array.isArray(task.assigned_to)
        ? task.assigned_to
            .map((u: any) => u?.email || u?.username || "")
            .join(" ")
        : "";

      const taskName = (task.name || "").toLowerCase();
      const taskDescription = (task.description || "").toLowerCase();
      const taskDetails = (task.details || "").toLowerCase();
      const taskNumber = (task.task_number || "").toLowerCase();

      matchesSearch =
        taskName.includes(searchLower) ||
        taskDescription.includes(searchLower) ||
        taskDetails.includes(searchLower) ||
        taskNumber.includes(searchLower) ||
        assigneeNames.toLowerCase().includes(searchLower);
    }

    // Status filter matching
    const matchesFilter =
      filterStatus === "all" || isStatusEqual(task.status, filterStatus);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="px-6 py-8">
          <div className="pm-card p-8 text-center border-red-200 bg-red-50">
            <p className="text-red-600 font-medium mb-2">
              Failed to load tasks
            </p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchTasks}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader />
      <div className="px-6 py-8 max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Tasks</h1>
            <p className="text-gray-600">
              Manage and track all tasks in this project
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm hover:shadow-md min-w-[160px] flex-shrink-0 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value={TaskStatus.Backlog}>Backlog</option>
              <option value={TaskStatus.Created}>Created</option>
              <option value={TaskStatus.Active}>In Progress</option>
              <option value={TaskStatus.Completed}>Done</option>
            </select>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 flex-shrink-0">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("board")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "board"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Board view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {/* New Task Card */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <CreateCard
                title="Create New Task"
                description="New task"
                icon={Plus}
              />
            </DialogTrigger>
            <TaskCreateComponent
              projectId={projectId}
              onClose={handleTaskCreated}
            />
          </Dialog>
          <StatCard
            icon={FileText}
            value={tasks.filter((t) => t.status === TaskStatus.Created).length}
            label="Created"
            className="p-4"
            iconBgColor="bg-gray-100"
            iconColor="text-gray-700"
          />
          <StatCard
            icon={ListTodo}
            value={tasks.length}
            label="Total Tasks"
            className="p-4"
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={CheckCircle2}
            value={
              tasks.filter((t) => t.status === TaskStatus.Completed).length
            }
            label="Completed"
            className="p-4"
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            icon={PlayCircle}
            value={tasks.filter((t) => t.status === TaskStatus.Active).length}
            label="In Progress"
            className="p-4"
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
        </div>

        {viewMode === "list" ? (
          filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-8">
              {filteredTasks.map((task) => (
                <TaskCard 
                  key={task.taskid} 
                  task={task} 
                  projectId={projectId}
                  onDelete={handleTaskDeleted}
                />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="pm-card">
              <EmptyState
                icon={ListTodo}
                title="No tasks yet"
                description="Create your first task to get started"
                action={{
                  label: "Create Task",
                  onClick: () => setDialogOpen(true),
                }}
              />
            </div>
          ) : (
            (searchQuery || filterStatus !== "all") && (
              <div className="pm-card">
                <EmptyState
                  icon={Search}
                  title="No tasks found"
                  description="Try adjusting your filters or search query"
                />
              </div>
            )
          )
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="flex gap-6 pb-4 min-w-max">
              {[
                { key: TaskStatus.Backlog, label: "Backlog" },
                { key: TaskStatus.Created, label: "Created" },
                { key: TaskStatus.Active, label: "In Progress" },
                { key: TaskStatus.Completed, label: "Done" },
              ].map(({ key, label }, index) => {
                const statusTasks = filteredTasks.filter(
                  (t) => t.status === key
                );
                return (
                  <React.Fragment key={key}>
                    <div className="flex flex-col min-w-[240px] max-w-[260px]">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`pm-status-dot ${getStatusDotClass(
                                key
                              )}`}
                            />
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {label}
                            </h3>
                          </div>
                          <span className="pm-badge">{statusTasks.length}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-8 flex-1 min-h-[200px]">
                        {statusTasks.map((task) => (
                          <TaskCard
                            key={task.taskid}
                            task={task}
                            projectId={projectId}
                            compact={true}
                            onDelete={handleTaskDeleted}
                          />
                        ))}
                      </div>
                    </div>
                    {index < 3 && (
                      <Separator
                        orientation="vertical"
                        className="h-auto bg-gray-200 flex-shrink-0"
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTasksPage;
