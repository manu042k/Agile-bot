"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Edit, MoreVertical, User, Calendar, Flag, Tag, MessageSquare, Clock, CheckCircle2, FileText, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/common/PageHeader";
import { getStatusDotClass, getPriorityClass } from "@/lib/colorUtils";
import { Task } from "@/types/project";

export default function GlobalTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTask(data);
        }
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task not found</h2>
          <Link href="/tasks" className="text-orange-600 hover:text-orange-700">
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  const statusDotClass = getStatusDotClass(task.status);
  const priorityClass = getPriorityClass(task.priority);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={task.name}
        description={`Task ${task.task_number}`}
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
                <p className="text-gray-700 whitespace-pre-line">{task.description || "No description"}</p>
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
                  {task.comments && task.comments.length > 0 ? (
                    task.comments.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-900 text-white text-xs">
                            {comment.user?.email?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">{comment.user?.email || "Unknown"}</span>
                            <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No comments yet</p>
                  )}
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
                  {task.assigned_to && task.assigned_to.length > 0 ? (
                    task.assigned_to.map((assignee: any) => (
                      <div key={assignee.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-900 text-white text-xs">
                            {assignee.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{assignee.email}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No assignees</p>
                  )}
                  <button className="w-full text-sm text-gray-600 hover:text-gray-900 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    + Add assignee
                  </button>
                </div>
              </div>

              {/* Created Date */}
              <div className="pm-card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Created</h3>
                <Separator className="my-4" />
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{new Date(task.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="pm-card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Tags</h3>
                <Separator className="my-4" />
                <div className="flex flex-wrap gap-2">
                  {task.tags && task.tags.length > 0 ? (
                    task.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No tags</p>
                  )}
                  <button className="px-2.5 py-1 border border-gray-200 text-gray-600 rounded-full text-xs font-medium hover:border-gray-300">
                    + Add tag
                  </button>
                </div>
              </div>

              {/* Related Tasks */}
              {task.related_work && task.related_work.length > 0 && (
                <div className="pm-card p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Related Tasks</h3>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    {task.related_work.map((relatedTask: any) => (
                      <Link
                        key={relatedTask.taskid}
                        href={`/tasks/${relatedTask.taskid}`}
                        className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900">{relatedTask.name}</p>
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

