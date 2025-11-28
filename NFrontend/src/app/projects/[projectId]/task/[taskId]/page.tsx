"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, MoreVertical, User, Calendar, Flag, Clock, CheckCircle2, Link as LinkIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import taskService from "@/services/taskService";
import projectService from "@/services/projectService";
import { Task, TaskStatus, TaskPriority, TaskSize, Project } from "@/types/project";
import { getStatusLabel, getStatusDotClass } from "@/lib/statusUtils";
import toast from "react-hot-toast";

const TaskDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const taskId = params.taskId as string;
  
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    fetchTaskData();
  }, [projectId, taskId]);

  const fetchTaskData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [taskData, projectData] = await Promise.all([
        taskService.getTask(taskId),
        projectService.getProject(projectId),
      ]);
      setTask(taskData);
      setProject(projectData);
    } catch (err: any) {
      console.error("Error fetching task:", err);
      setError(err.message || "Failed to load task");
      toast.error("Failed to load task");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;
    try {
      await taskService.updateTaskStatus(task.taskid, newStatus as TaskStatus);
      await fetchTaskData();
      toast.success("Status updated successfully");
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!task) return;
    try {
      await taskService.updateTask(task.taskid, { priority: newPriority as TaskPriority });
      await fetchTaskData();
      toast.success("Priority updated successfully");
    } catch (err: any) {
      toast.error("Failed to update priority");
    }
  };

  const handleSizeChange = async (newSize: string) => {
    if (!task) return;
    try {
      await taskService.updateTask(task.taskid, { size: newSize as TaskSize });
      await fetchTaskData();
      toast.success("Size updated successfully");
    } catch (err: any) {
      toast.error("Failed to update size");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !task) return;
    
    try {
      await taskService.createComment(task.taskid, commentText);
      setCommentText("");
      await fetchTaskData();
      toast.success("Comment added successfully");
    } catch (err: any) {
      toast.error("Failed to add comment");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="pm-card p-8 text-center border-red-200 bg-red-50">
          <p className="text-red-600 font-medium mb-2">Failed to load task</p>
          <p className="text-sm text-red-500 mb-4">{error || "Task not found"}</p>
          <Link
            href={`/projects/${projectId}/tasks`}
            className="pm-button-primary inline-block"
          >
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }


  const getPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        {/* Breadcrumb */}
        <div className="px-6 py-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/projects" className="hover:text-gray-900">Projects</Link>
            <span>/</span>
            <Link href={`/projects/${projectId}`} className="hover:text-gray-900">{project?.name || "Project"}</Link>
            <span>/</span>
            <Link href={`/projects/${projectId}/tasks`} className="hover:text-gray-900">Tasks</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{task.name}</span>
          </div>
        </div>
        {/* Header Content */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/projects/${projectId}/tasks`}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Back to Tasks"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{task.name}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Task #{task.task_number} in <Link href={`/projects/${projectId}`} className="hover:text-gray-900 font-medium">{project?.name || "Project"}</Link>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="pm-button-secondary">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left Panel - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="pm-card p-6">
                <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                <Separator className="my-4" />
                <p className="text-gray-700 leading-relaxed mb-4">{task.description || "No description provided"}</p>
                {task.details && (
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="font-medium text-gray-900 mb-2">Details</h3>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">{task.details}</pre>
                  </div>
                )}
              </div>

              {/* Comments */}
              <div className="pm-card p-6">
                <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
                <Separator className="my-4" />
                <div className="space-y-4 mb-4">
                  {task.comments && task.comments.length > 0 ? (
                    task.comments.map((comment: any) => (
                      <div key={comment.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-900 text-white text-xs">
                            {comment.user?.email?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">
                              {comment.user?.email?.split("@")[0] || "Unknown User"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
                  )}
                </div>
                <form onSubmit={handleAddComment} className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-900 text-white text-xs">U</AvatarFallback>
                  </Avatar>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 pm-input"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button type="submit" className="pm-button-primary text-sm px-4">
                    Comment
                  </button>
                </form>
              </div>

            </div>

            {/* Right Panel - Sidebar */}
            <div className="space-y-6">
              {/* Status & Priority */}
              <div className="pm-card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Status</label>
                    <select 
                      className="pm-input w-full" 
                      value={task.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      <option value={TaskStatus.Backlog}>Backlog</option>
                      <option value={TaskStatus.Created}>Created</option>
                      <option value={TaskStatus.Active}>In Progress</option>
                      <option value={TaskStatus.Completed}>Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Priority</label>
                    <select 
                      className="pm-input w-full" 
                      value={task.priority}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                    >
                      <option value={TaskPriority.Low}>Low</option>
                      <option value={TaskPriority.Normal}>Normal</option>
                      <option value={TaskPriority.High}>High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Size</label>
                    <select 
                      className="pm-input w-full" 
                      value={task.size}
                      onChange={(e) => handleSizeChange(e.target.value)}
                    >
                      <option value={TaskSize.Small}>Small</option>
                      <option value={TaskSize.Medium}>Medium</option>
                      <option value={TaskSize.Large}>Large</option>
                      <option value={TaskSize.ExtraLarge}>Extra Large</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Assignees */}
              <div className="pm-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Assignees</h3>
                </div>
                <div className="space-y-3">
                  {task.assigned_to && Array.isArray(task.assigned_to) && task.assigned_to.length > 0 ? (
                    task.assigned_to.map((assignee: any) => (
                      <div key={assignee.id || assignee} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-900 text-white text-xs">
                            {typeof assignee === 'object' 
                              ? (assignee.email?.charAt(0).toUpperCase() || "U")
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {typeof assignee === 'object' 
                              ? (assignee.email?.split("@")[0] || assignee.username || "Unknown")
                              : "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {typeof assignee === 'object' ? assignee.email : ""}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">Unassigned</p>
                  )}
                </div>
              </div>

              {/* Related Tasks */}
              {task.related_work && task.related_work.length > 0 && (
                <div className="pm-card p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Related Tasks</h3>
                  <div className="space-y-2">
                    {task.related_work.map((relatedTask: any) => (
                      <Link
                        key={relatedTask.taskid}
                        href={`/projects/${projectId}/task/${relatedTask.taskid}`}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <LinkIcon className="h-4 w-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{relatedTask.name}</p>
                          <p className="text-xs text-gray-500">{getStatusLabel(relatedTask.status)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity */}
              <div className="pm-card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-900">Created by {task.created_by === "ai" ? "AI" : "User"}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(task.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-900">Last updated</p>
                      <p className="text-xs text-gray-500">{formatDateTime(task.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;

