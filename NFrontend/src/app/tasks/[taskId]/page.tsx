"use client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, MoreVertical, User, Calendar, Flag, Tag, MessageSquare, Clock, CheckCircle2, FileText, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/common/PageHeader";
import { getStatusDotClass, getPriorityClass } from "@/lib/colorUtils";

// Mock task data
const getMockTask = (taskId: string) => ({
  id: taskId,
  title: "Implement user authentication",
  description: "Set up JWT authentication with refresh tokens. Include login, register, and password reset functionality.",
  details: "This task involves:\n1. Setting up JWT token generation and validation\n2. Creating authentication middleware\n3. Implementing refresh token rotation\n4. Adding password hashing with bcrypt\n5. Creating login and registration endpoints\n6. Setting up password reset flow",
  status: "in_progress",
  priority: "high",
  size: "medium",
  project: {
    id: 1,
    name: "E-Commerce Platform",
  },
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
    { id: 2, title: "Design authentication UI", status: "done", projectId: 1 },
    { id: 3, title: "Write API documentation", status: "todo", projectId: 1 },
  ],
  comments: [
    { id: 1, user: "John Doe", content: "Started working on JWT implementation", timestamp: "2 hours ago", avatar: null },
    { id: 2, user: "Jane Smith", content: "Make sure to include refresh token rotation", timestamp: "1 hour ago", avatar: null },
  ],
  attachments: [
    { id: 1, name: "auth-spec.pdf", size: "2.4 MB" },
    { id: 2, name: "jwt-example.js", size: "15 KB" },
  ],
});

export default function GlobalTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;
  const task = getMockTask(taskId);

  const statusDotClass = getStatusDotClass(task.status);
  const priorityClass = getPriorityClass(task.priority);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={task.title}
        description={`Task in ${task.project.name}`}
        icon={CheckCircle2}
      />

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Link
              href="/tasks"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tasks
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="pm-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <Separator className="my-4" />
                <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
                {task.details && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{task.details}</p>
                  </div>
                )}
              </div>

              {/* Comments */}
              <div className="pm-card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
                <Separator className="my-4" />
                <div className="space-y-4 mb-4">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-900 text-white text-xs">
                          {comment.user[0]}
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
                <div className="flex gap-3">
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
                  <Separator className="my-4" />
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
                <Separator className="my-4" />
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
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Assignees */}
              <div className="pm-card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Assignees</h3>
                <Separator className="my-4" />
                <div className="space-y-3">
                  {task.assignees.map((assignee) => (
                    <div key={assignee.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-900 text-white text-xs">
                          {assignee.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{assignee.name}</p>
                        <p className="text-xs text-gray-500">{assignee.email}</p>
                      </div>
                    </div>
                  ))}
                  <button className="w-full text-sm text-gray-600 hover:text-gray-900 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    + Add assignee
                  </button>
                </div>
              </div>

              {/* Due Date */}
              <div className="pm-card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Due Date</h3>
                <Separator className="my-4" />
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="pm-card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Tags</h3>
                <Separator className="my-4" />
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  <button className="px-2.5 py-1 border border-gray-200 text-gray-600 rounded-full text-xs font-medium hover:border-gray-300">
                    + Add tag
                  </button>
                </div>
              </div>

              {/* Related Tasks */}
              {task.relatedTasks.length > 0 && (
                <div className="pm-card p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Related Tasks</h3>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    {task.relatedTasks.map((relatedTask) => (
                      <Link
                        key={relatedTask.id}
                        href={`/projects/${relatedTask.projectId}/task/${relatedTask.id}`}
                        className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900">{relatedTask.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{relatedTask.status}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pm-card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    Duplicate task
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    Move to another project
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    Delete task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

