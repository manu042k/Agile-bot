"use client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, MoreVertical, User, Calendar, Flag, Tag, MessageSquare, Clock, CheckCircle2, FileText, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock task data
const getMockTask = (projectId: string, taskId: string) => ({
  id: taskId,
  title: "Implement user authentication",
  description: "Set up JWT authentication with refresh tokens. Include login, register, and password reset functionality.",
  details: "This task involves:\n1. Setting up JWT token generation and validation\n2. Creating authentication middleware\n3. Implementing refresh token rotation\n4. Adding password hashing with bcrypt\n5. Creating login and registration endpoints\n6. Setting up password reset flow",
  status: "in_progress",
  priority: "high",
  size: "medium",
  assignees: [
    { id: 1, name: "John Doe", email: "john@example.com", avatar: null },
    { id: 2, name: "Jane Smith", email: "jane@example.com", avatar: null },
  ],
  dueDate: "2024-02-15",
  createdBy: "AI",
  createdAt: "2024-01-20",
  updatedAt: "2024-02-10",
  tags: ["Backend", "Security", "Authentication"],
  relatedTasks: [
    { id: 2, title: "Design authentication UI", status: "done" },
    { id: 3, title: "Write API documentation", status: "todo" },
  ],
  comments: [
    { id: 1, user: "John Doe", content: "Started working on JWT implementation", timestamp: "2 hours ago" },
    { id: 2, user: "Jane Smith", content: "Make sure to include refresh token rotation", timestamp: "1 hour ago" },
  ],
  attachments: [
    { id: 1, name: "auth_design.pdf", size: "2.4 MB", type: "pdf" },
  ],
});

const TaskDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const taskId = params.taskId as string;
  const task = getMockTask(projectId, taskId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "pm-status-done";
      case "in_progress": return "pm-status-progress";
      case "todo": return "pm-status-todo";
      default: return "pm-status-backlog";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "pm-priority-high";
      case "medium": return "pm-priority-medium";
      default: return "pm-priority-low";
    }
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
            <Link href={`/projects/${projectId}`} className="hover:text-gray-900">E-Commerce Platform</Link>
            <span>/</span>
            <Link href={`/projects/${projectId}/tasks`} className="hover:text-gray-900">Tasks</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{task.title}</span>
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
                <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Task #{task.id} in <Link href={`/projects/${projectId}`} className="hover:text-gray-900 font-medium">E-Commerce Platform</Link>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="pm-card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed mb-4">{task.description}</p>
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-2">Details</h3>
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">{task.details}</pre>
                </div>
              </div>

              {/* Comments */}
              <div className="pm-card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
                <div className="space-y-4 mb-4">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-900 text-white text-xs">
                          {comment.user.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm">{comment.user}</span>
                          <span className="text-xs text-gray-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-900 text-white text-xs">U</AvatarFallback>
                  </Avatar>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 pm-input"
                  />
                  <button className="pm-button-primary text-sm px-4">
                    Comment
                  </button>
                </div>
              </div>

              {/* Attachments */}
              {task.attachments.length > 0 && (
                <div className="pm-card p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>
                  <div className="space-y-2">
                    {task.attachments.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500">{file.size}</p>
                          </div>
                        </div>
                        <button className="text-sm text-gray-600 hover:text-gray-900">Download</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Sidebar */}
            <div className="space-y-6">
              {/* Status & Priority */}
              <div className="pm-card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Status</label>
                    <select className="pm-input w-full" defaultValue={task.status}>
                      <option value="backlog">Backlog</option>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Priority</label>
                    <select className="pm-input w-full" defaultValue={task.priority}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Size</label>
                    <select className="pm-input w-full" defaultValue={task.size}>
                      <option value="s">Small</option>
                      <option value="m">Medium</option>
                      <option value="l">Large</option>
                      <option value="xl">Extra Large</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Assignees */}
              <div className="pm-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Assignees</h3>
                  <button className="text-xs text-gray-600 hover:text-gray-900">Add</button>
                </div>
                <div className="space-y-3">
                  {task.assignees.map((assignee) => (
                    <div key={assignee.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-900 text-white text-xs">
                          {assignee.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{assignee.name}</p>
                        <p className="text-xs text-gray-500 truncate">{assignee.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div className="pm-card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Due Date</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <input
                    type="date"
                    defaultValue={task.dueDate}
                    className="pm-input flex-1"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="pm-card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                  <button className="px-2 py-1 rounded text-xs border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600">
                    + Add tag
                  </button>
                </div>
              </div>

              {/* Related Tasks */}
              {task.relatedTasks.length > 0 && (
                <div className="pm-card p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Related Tasks</h3>
                  <div className="space-y-2">
                    {task.relatedTasks.map((relatedTask) => (
                      <Link
                        key={relatedTask.id}
                        href={`/projects/${projectId}/task/${relatedTask.id}`}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <LinkIcon className="h-4 w-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{relatedTask.title}</p>
                          <p className="text-xs text-gray-500">{relatedTask.status}</p>
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
                      <p className="text-gray-900">Created by {task.createdBy}</p>
                      <p className="text-xs text-gray-500">{task.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-900">Last updated</p>
                      <p className="text-xs text-gray-500">{task.updatedAt}</p>
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

