"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, Search, Filter, Calendar, User, Flag, MoreVertical, List, LayoutGrid, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ProjectHeader from "@/components/projects/ProjectHeader";
import TaskCreateComponent from "@/components/projects/TaskCreateComponent";
import taskService from "@/services/taskService";
import { Task, TaskStatus, TaskPriority } from "@/types/project";
import toast from "react-hot-toast";

const ProjectTasksPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
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
  
  const filteredTasks = tasks.filter(task => {
    const assigneeNames = Array.isArray(task.assigned_to) 
      ? task.assigned_to.map((u: any) => u?.email || "").join(" ")
      : "";
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assigneeNames.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || task.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "completed": 
      case "done": return "pm-status-done";
      case "active":
      case "in_progress": return "pm-status-progress";
      case "created":
      case "todo": return "pm-status-todo";
      default: return "pm-status-backlog";
    }
  };

  const getAssigneeNames = (task: Task) => {
    if (!task.assigned_to || !Array.isArray(task.assigned_to)) return "Unassigned";
    if (task.assigned_to.length === 0) return "Unassigned";
    return task.assigned_to.map((u: any) => u?.email?.split('@')[0] || "Unknown").join(", ");
  };

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
            <p className="text-red-600 font-medium mb-2">Failed to load tasks</p>
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
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Tasks</h1>
              <p className="text-gray-600">Manage and track all tasks in this project</p>
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
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <button className="pm-button-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </button>
                </DialogTrigger>
                <TaskCreateComponent projectId={projectId} onClose={handleTaskCreated} />
              </Dialog>
            </div>
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
                className="pm-input !pl-10 pr-3 w-full"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pm-input min-w-[140px] flex-shrink-0"
            >
              <option value="all">All Status</option>
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <button className="pm-button-secondary whitespace-nowrap flex-shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="pm-card p-4">
            <p className="text-2xl font-semibold text-gray-900">{tasks.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
          </div>
          <div className="pm-card p-4">
            <p className="text-2xl font-semibold text-gray-900">{tasks.filter(t => t.status === TaskStatus.Completed).length}</p>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </div>
          <div className="pm-card p-4">
            <p className="text-2xl font-semibold text-gray-900">{tasks.filter(t => t.status === TaskStatus.Active).length}</p>
            <p className="text-xs text-gray-500 mt-1">In Progress</p>
          </div>
          <div className="pm-card p-4">
            <p className="text-2xl font-semibold text-gray-900">{tasks.filter(t => t.status === TaskStatus.Created).length}</p>
            <p className="text-xs text-gray-500 mt-1">To Do</p>
          </div>
        </div>

        {viewMode === "list" ? (
          filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <Link key={task.taskid} href={`/projects/${projectId}/task/${task.taskid}`}>
                  <div className="pm-card p-5 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`pm-status-dot ${getStatusColor(task.status)} flex-shrink-0 mt-1.5`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-medium text-gray-900 text-base">{task.name}</h3>
                            <span className={`pm-badge ${
                              task.priority === TaskPriority.High ? "pm-priority-high" :
                              task.priority === TaskPriority.Normal ? "pm-priority-medium" :
                              "pm-priority-low"
                            } flex-shrink-0`}>
                              <Flag className="h-3 w-3 mr-1" />
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-1">{task.description || task.details}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 flex-shrink-0" />
                              {getAssigneeNames(task)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                              {new Date(task.created_at).toLocaleDateString()}
                            </span>
                          </div>
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
              ))}
            </div>
          ) : (
            <div className="pm-card p-16 text-center">
              <div className="max-w-sm mx-auto">
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
                  <button className="pm-button-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </button>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: TaskStatus.Backlog, label: "Backlog" },
              { key: TaskStatus.Created, label: "To Do" },
              { key: TaskStatus.Active, label: "In Progress" },
              { key: TaskStatus.Completed, label: "Done" }
            ].map(({ key, label }) => {
              const statusTasks = filteredTasks.filter(t => t.status === key);
              return (
                <div key={key} className="flex flex-col">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`pm-status-dot ${
                          key === TaskStatus.Completed ? "pm-status-done" :
                          key === TaskStatus.Active ? "pm-status-progress" :
                          key === TaskStatus.Created ? "pm-status-todo" :
                          "pm-status-backlog"
                        }`} />
                        <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
                      </div>
                      <span className="pm-badge">{statusTasks.length}</span>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1 min-h-[200px]">
                    {statusTasks.map((task) => (
                      <Link key={task.taskid} href={`/projects/${projectId}/task/${task.taskid}`}>
                        <div className="pm-card p-4 cursor-pointer hover:shadow-md transition-all">
                          <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">{task.name}</h4>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                            <span className="truncate flex-1 min-w-0">{getAssigneeNames(task)}</span>
                            <span className={`pm-badge ml-2 flex-shrink-0 ${
                              task.priority === TaskPriority.High ? "pm-priority-high" :
                              task.priority === TaskPriority.Normal ? "pm-priority-medium" :
                              "pm-priority-low"
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </Link>
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
  );
};

export default ProjectTasksPage;


