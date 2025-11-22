"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Search, Filter, Calendar, User, Flag, MoreVertical, List, LayoutGrid, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ProjectHeader from "@/components/projects/ProjectHeader";
import TaskCreateComponent from "@/components/projects/TaskCreateComponent";

// Mock tasks data for this project
const getMockTasks = (projectId: string) => [
  { id: 1, title: "Implement user authentication", assignee: "John Doe", dueDate: "2024-02-15", priority: "high", status: "in_progress", tags: ["Backend", "Security"], description: "Set up JWT authentication with refresh tokens" },
  { id: 2, title: "Design product catalog UI", assignee: "Jane Smith", dueDate: "2024-02-18", priority: "medium", status: "todo", tags: ["Frontend", "UI"], description: "Create responsive product listing page" },
  { id: 3, title: "Set up shopping cart functionality", assignee: "Mike Johnson", dueDate: "2024-02-20", priority: "high", status: "todo", tags: ["Frontend", "Backend"], description: "Implement cart state management and API" },
  { id: 4, title: "Payment integration", assignee: "Sarah Wilson", dueDate: "2024-02-25", priority: "high", status: "backlog", tags: ["Backend", "Payment"], description: "Integrate Stripe payment gateway" },
  { id: 5, title: "Write API documentation", assignee: "Alex Brown", dueDate: "2024-02-22", priority: "low", status: "done", tags: ["Documentation"], description: "Document all REST API endpoints" },
  { id: 6, title: "Database schema design", assignee: "Chris Lee", dueDate: "2024-02-17", priority: "high", status: "done", tags: ["Database"], description: "Design and implement database schema" },
];

const ProjectTasksPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const mockTasks = getMockTasks(projectId);
  
  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesFilter;
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
              <Dialog>
                <DialogTrigger asChild>
                  <button className="pm-button-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </button>
                </DialogTrigger>
                <TaskCreateComponent projectId={projectId} onClose={() => {}} />
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
            <p className="text-2xl font-semibold text-gray-900">{mockTasks.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
          </div>
          <div className="pm-card p-4">
            <p className="text-2xl font-semibold text-gray-900">{mockTasks.filter(t => t.status === "done").length}</p>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </div>
          <div className="pm-card p-4">
            <p className="text-2xl font-semibold text-gray-900">{mockTasks.filter(t => t.status === "in_progress").length}</p>
            <p className="text-xs text-gray-500 mt-1">In Progress</p>
          </div>
          <div className="pm-card p-4">
            <p className="text-2xl font-semibold text-gray-900">{mockTasks.filter(t => t.status === "todo").length}</p>
            <p className="text-xs text-gray-500 mt-1">To Do</p>
          </div>
        </div>

        {viewMode === "list" ? (
          filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <Link key={task.id} href={`/projects/${projectId}/task/${task.id}`}>
                  <div className="pm-card p-5 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`pm-status-dot ${getStatusColor(task.status)} flex-shrink-0 mt-1.5`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-medium text-gray-900 text-base">{task.title}</h3>
                            <span className={`pm-badge ${
                              task.priority === "high" ? "pm-priority-high" :
                              task.priority === "medium" ? "pm-priority-medium" :
                              "pm-priority-low"
                            } flex-shrink-0`}>
                              <Flag className="h-3 w-3 mr-1" />
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-1">{task.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
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
            {["backlog", "todo", "in_progress", "done"].map((status) => {
              const statusTasks = filteredTasks.filter(t => t.status === status);
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
                      <Link key={task.id} href={`/projects/${projectId}/task/${task.id}`}>
                        <div className="pm-card p-4 cursor-pointer hover:shadow-md transition-all">
                          <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">{task.title}</h4>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                            <span className="truncate flex-1 min-w-0">{task.assignee}</span>
                            <span className={`pm-badge ml-2 flex-shrink-0 ${
                              task.priority === "high" ? "pm-priority-high" :
                              task.priority === "medium" ? "pm-priority-medium" :
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

