"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Pen, Link as LinkIcon, Loader2, Save, X, Check, ChevronsUpDown, Trash2 } from "lucide-react";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";
import AvatarCircles from "../ui/avatar-circles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import taskService from "@/services/taskService";
import projectService from "@/services/projectService";
import sprintService from "@/services/sprintService";
import {
  Task,
  TaskPriority,
  TaskStatus,
  TaskSize,
  TeamMember,
  Project,
  Sprint,
} from "@/types/project";
import { getStatusLabel, getStatusDotClass } from "@/lib/statusUtils";
import Link from "next/link";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { useUser } from "@/hooks/useUser";

interface Props {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
  onDelete?: (taskId: string) => void;
}

const TaskViewComponent: React.FC<Props> = ({ task: initialTask, onUpdate, onDelete }) => {
  const [task, setTask] = useState<Task>(initialTask);
  const [projectMembers, setProjectMembers] = useState<TeamMember[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  
  // Localized editing state
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [commentText, setCommentText] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { user: currentUser } = useUser();

  // Check if current user can delete task (project creator or team admin/owner)
  const canDeleteTask = () => {
    if (!currentUser || !project) {
      console.log("Delete check: No user or project", { currentUser, project });
      return false;
    }
    
    console.log("Delete check:", {
      currentUserId: currentUser.id,
      projectCreatorId: project.created_by?.id,
      isCreator: project.created_by?.id === currentUser.id,
      hasTeam: !!project.team,
      teamMembers: project.team?.members
    });
    
    // Check if user is project creator
    if (project.created_by?.id === currentUser.id) return true;
    
    // Check if user is team admin or owner
    if (project.team) {
      const currentUserMembership = project.team.members.find(
        (member) => member.user?.id === currentUser.id
      );
      console.log("Team membership:", currentUserMembership);
      return (
        currentUserMembership?.role === "admin" ||
        currentUserMembership?.role === "owner"
      );
    }
    
    return false;
  };

  // Fetch project members, details, and sprints
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingProject(true);
      try {
        const projectData = await projectService.getProject(task.Project);
        setProject(projectData);
        setProjectMembers(projectData.team.members);
        
        // Fetch sprints for the project
        const sprintsData = await sprintService.getSprints(task.Project);
        setSprints(sprintsData);
      } catch (err) {
        console.error("Failed to fetch project data", err);
      } finally {
        setIsLoadingProject(false);
      }
    };
    fetchData();
  }, [task.Project]);

  // Update local task state when initialTask changes
  useEffect(() => {
    setTask(initialTask);
    console.log("Task assigned_to:", initialTask.assigned_to);
  }, [initialTask]);

  const startEditing = (section: string, value: any) => {
    setEditingSection(section);
    // Ensure value is not null/undefined for string fields
    if (section === 'description' || section === 'details' || section === 'name') {
      setEditValue(value || "");
    } else {
      setEditValue(value);
    }
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditValue(null);
  };

  const handleSaveSection = async (section: string, data: Partial<Task>) => {
    setIsSaving(true);
    try {
      const updated = await taskService.updateTask(task.taskid, data);
      setTask(updated);
      onUpdate(updated);
      setEditingSection(null);
      setEditValue(null);
      router.refresh();
      toast.success("Updated successfully");
    } catch (err) {
      toast.error("Failed to update");
      console.error("Update failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Handlers for Direct Updates ---

  const handleStatusChange = async (newStatus: string) => {
    try {
      const updated = await taskService.updateTaskStatus(task.taskid, newStatus as TaskStatus);
      setTask({ ...task, status: newStatus as TaskStatus });
      onUpdate({ ...task, status: newStatus as TaskStatus });
      toast.success("Status updated successfully");
      router.refresh();
    } catch (err: any) {
      console.error("Status update error:", err);
      toast.error(err?.response?.data?.detail || "Failed to update status");
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      const updated = await taskService.updateTask(task.taskid, { priority: newPriority as TaskPriority });
      setTask({ ...task, priority: newPriority as TaskPriority });
      onUpdate({ ...task, priority: newPriority as TaskPriority });
      toast.success("Priority updated successfully");
      router.refresh();
    } catch (err: any) {
      console.error("Priority update error:", err);
      toast.error(err?.response?.data?.detail || "Failed to update priority");
    }
  };

  const handleSizeChange = async (newSize: string) => {
    try {
      const updated = await taskService.updateTask(task.taskid, { size: newSize as TaskSize });
      setTask({ ...task, size: newSize as TaskSize });
      onUpdate({ ...task, size: newSize as TaskSize });
      toast.success("Size updated successfully");
      router.refresh();
    } catch (err: any) {
      console.error("Size update error:", err);
      toast.error(err?.response?.data?.detail || "Failed to update size");
    }
  };

  const handleSprintChange = async (newSprintId: string) => {
    try {
      const sprintId = newSprintId === "none" ? null : parseInt(newSprintId);
      const updated = await taskService.updateTask(task.taskid, { sprint: sprintId });
      setTask({ ...task, sprint: sprintId });
      onUpdate({ ...task, sprint: sprintId });
      toast.success(sprintId ? "Task linked to sprint" : "Task removed from sprint");
      router.refresh();
    } catch (err: any) {
      console.error("Sprint update error:", err);
      toast.error(err?.response?.data?.detail || "Failed to update sprint");
    }
  };

  const handleAssigneesSave = async () => {
    setIsSaving(true);
    try {
      // editValue is array of user IDs
      console.log("Saving assignees:", editValue);
      const updated = await taskService.updateTask(task.taskid, { assigned_to: editValue });
      console.log("Updated task:", updated);
      setTask(updated);
      onUpdate(updated);
      setEditingSection(null);
      toast.success("Assignees updated");
      router.refresh();
    } catch (err: any) {
      console.error("Assignees update error:", err);
      toast.error(err?.response?.data?.detail || "Failed to update assignees");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAssignee = (userId: number) => {
    const currentIds = Array.isArray(editValue) ? [...editValue] : [];
    const index = currentIds.indexOf(userId);
    if (index > -1) {
      currentIds.splice(index, 1);
    } else {
      currentIds.push(userId);
    }
    setEditValue(currentIds);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    try {
      await taskService.createComment(task.taskid, commentText);
      setCommentText("");
      const updatedTask = await taskService.getTask(task.taskid);
      setTask(updatedTask);
      onUpdate(updatedTask);
      toast.success("Message sent");
    } catch (err: any) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message");
    }
  };

  const handleDeleteTask = async () => {
    try {
      setIsDeleting(true);
      await taskService.deleteTask(task.taskid);
      toast.success("Task deleted successfully");
      setDeleteDialogOpen(false);
      
      // Call onDelete callback to close modal and remove card
      if (onDelete) {
        onDelete(task.taskid);
      } else {
        // Fallback: redirect to tasks page if no callback provided
        router.push(`/projects/${task.Project}/tasks`);
        router.refresh();
      }
    } catch (err: any) {
      console.error("Failed to delete task:", err);
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
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

  return (
    <div className="-m-6">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Task Number Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                #{task.task_number}
              </span>
              {isLoadingProject ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <span className="text-sm text-gray-500">{project?.name}</span>
              )}
            </div>
            
            {/* Task Title */}
            {editingSection === 'name' ? (
              <div className="flex items-center gap-2">
                <Input 
                  value={editValue} 
                  onChange={(e) => setEditValue(e.target.value)}
                  className="text-2xl font-bold border-none shadow-none focus-visible:ring-1 focus-visible:ring-orange-500 px-0"
                  disabled={isSaving}
                  autoFocus
                />
                <Button size="sm" className="pm-button-primary h-8" onClick={() => handleSaveSection('name', { name: editValue })} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                </Button>
                <Button size="sm" variant="ghost" className="h-8" onClick={cancelEditing} disabled={isSaving}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <h1 
                className="text-2xl font-bold text-gray-900 cursor-text hover:text-gray-700 transition-colors group flex items-center gap-2"
                onClick={() => startEditing('name', task.name)}
              >
                {task.name}
                <Pen className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h1>
            )}
          </div>
          
          {/* Delete Button - Only for admins */}
          {canDeleteTask() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0">
        {/* Main Content Area */}
        <div className="px-8 py-6 space-y-6 bg-white/30 backdrop-blur-sm overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Details Section */}
          <div className="pm-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Details</h2>
              {editingSection !== 'details' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => startEditing('details', task.details || "")}
                  className="h-8 px-2 text-gray-500 hover:text-gray-900"
                >
                  <Pen className="w-3 h-3 mr-1" /> Edit
                </Button>
              )}
            </div>
            <Separator className="mb-4" />

            {editingSection === 'details' ? (
              <div className="space-y-3">
                <MarkdownEditor 
                  value={editValue} 
                  onChange={setEditValue} 
                  placeholder="Add details..."
                  className="min-h-[120px]"
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" className="pm-button-primary" onClick={() => handleSaveSection('details', { details: editValue })} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEditing} disabled={isSaving}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="text-sm text-gray-700 prose prose-sm max-w-none cursor-text hover:bg-gray-50/50 rounded-lg p-3 -mx-3 transition-colors"
                onClick={() => startEditing('details', task.details || "")}
              >
                {task.details ? (
                  <ReactMarkdown>{task.details}</ReactMarkdown>
                ) : (
                  <p className="text-gray-400 italic">Click to add details...</p>
                )}
              </div>
            )}
          </div>
            
          {/* Description Section - Separate Card */}
          <div className="pm-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Description</h2>
              {editingSection !== 'description' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => startEditing('description', task.description || "")}
                  className="h-8 px-2 text-gray-500 hover:text-gray-900"
                >
                  <Pen className="w-3 h-3 mr-1" /> Edit
                </Button>
              )}
            </div>
            <Separator className="mb-4" />
            
            {editingSection === 'description' ? (
              <div className="space-y-3">
                <MarkdownEditor 
                  value={editValue} 
                  onChange={setEditValue} 
                  placeholder="Add description..."
                  className="min-h-[150px]"
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" className="pm-button-primary" onClick={() => handleSaveSection('description', { description: editValue })} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEditing} disabled={isSaving}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="text-sm text-gray-700 prose prose-sm max-w-none cursor-text hover:bg-gray-50/50 rounded-lg p-3 -mx-3 transition-colors"
                onClick={() => startEditing('description', task.description || "")}
              >
                {task.description ? (
                  <ReactMarkdown>{task.description}</ReactMarkdown>
                ) : (
                  <p className="text-gray-400 italic">Click to add description...</p>
                )}
              </div>
            )}
          </div>

          {/* Chat Section */}
          <div className="pm-card p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Comments</h2>
            <Separator className="mb-4" />
            <div className="space-y-3 mb-6">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment: any) => (
                  <div key={comment.id || Math.random()} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
                    <Avatar className="h-7 w-7 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xs font-semibold">
                        {comment.user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {comment.user?.email?.split("@")[0] || "Unknown"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDateTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">No messages yet. Start the conversation!</p>
              )}
            </div>
            
            {/* Add Message Form */}
            <form onSubmit={handleAddComment} className="flex items-start gap-3 pt-4 border-t border-gray-100">
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">U</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white/60 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                />
                <Button type="submit" size="sm" className="pm-button-primary" disabled={!commentText.trim()}>
                  Send
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="px-6 py-6 space-y-6 bg-gray-50/50 border-l border-gray-100 overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Properties Section */}
          <div className="pm-card p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Properties</h3>
            <Separator className="mb-4" />
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-xs text-gray-500 mb-2 font-medium">Status</label>
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
              
              {/* Priority */}
              <div>
                <label className="block text-xs text-gray-500 mb-2 font-medium">Priority</label>
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
              
              {/* Size */}
              <div>
                <label className="block text-xs text-gray-500 mb-2 font-medium">Size</label>
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
              
              {/* Sprint */}
              <div>
                <label className="block text-xs text-gray-500 mb-2 font-medium">Sprint</label>
                <select 
                  className="pm-input w-full" 
                  value={task.sprint || "none"}
                  onChange={(e) => handleSprintChange(e.target.value)}
                >
                  <option value="none">No Sprint</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} ({sprint.status})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Tags */}
              <div>
                <label className="block text-xs text-gray-500 mb-2 font-medium">Tags</label>
                {editingSection === 'tags' ? (
                  <div className="space-y-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between h-10 px-3 rounded-lg border border-gray-200 bg-white/60 hover:bg-white/70 transition-all"
                          disabled={isSaving}
                        >
                          <span className="text-sm text-gray-700">
                            {editValue && editValue.length > 0
                              ? `${editValue.length} selected`
                              : "Select tags..."}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0 border border-gray-200 shadow-lg rounded-lg overflow-hidden">
                        <Command className="bg-white/90 backdrop-blur-sm">
                          <CommandList className="max-h-[200px] overflow-y-auto">
                            <CommandGroup className="p-1">
                              {["design", "documents", "frontend", "backend", "devops", "testing", "bug", "feature", "enhancement"].map((tag) => (
                                <CommandItem
                                  key={tag}
                                  value={tag}
                                  onSelect={() => {
                                    const currentTags = Array.isArray(editValue) ? [...editValue] : [];
                                    const index = currentTags.indexOf(tag);
                                    if (index > -1) {
                                      currentTags.splice(index, 1);
                                    } else {
                                      currentTags.push(tag);
                                    }
                                    setEditValue(currentTags);
                                  }}
                                  className="px-2 py-2 rounded-md cursor-pointer hover:bg-orange-50 aria-selected:bg-orange-50"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 text-orange-600",
                                      editValue && editValue.includes(tag)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <span className="font-medium text-sm text-gray-900 capitalize">
                                    {tag}
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    
                    <div className="flex flex-wrap gap-1">
                      {editValue && editValue.map((tag: string) => (
                        <div key={tag} className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full text-xs text-orange-800 border border-orange-200">
                          <span className="capitalize">{tag}</span>
                          <button 
                            onClick={() => {
                              const currentTags = [...editValue];
                              const index = currentTags.indexOf(tag);
                              if (index > -1) {
                                currentTags.splice(index, 1);
                                setEditValue(currentTags);
                              }
                            }} 
                            className="text-orange-600 hover:text-red-600" 
                            disabled={isSaving}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <Button size="sm" className="pm-button-secondary" onClick={cancelEditing} disabled={isSaving}>Cancel</Button>
                      <Button size="sm" className="pm-button-primary" onClick={async () => {
                        setIsSaving(true);
                        try {
                          const updated = await taskService.updateTask(task.taskid, { tags: editValue });
                          setTask(updated);
                          onUpdate(updated);
                          setEditingSection(null);
                          toast.success("Tags updated");
                          router.refresh();
                        } catch (err: any) {
                          console.error("Tags update error:", err);
                          toast.error(err?.response?.data?.detail || "Failed to update tags");
                        } finally {
                          setIsSaving(false);
                        }
                      }} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="flex flex-wrap gap-1 min-h-[32px] p-2 rounded-lg border border-gray-200 bg-white/60 cursor-pointer hover:bg-white/70 transition-all"
                    onClick={() => startEditing('tags', task.tags || [])}
                  >
                    {task.tags && task.tags.length > 0 ? (
                      task.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 border border-orange-200 capitalize">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">Click to add tags...</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assignees */}
          <div className="pm-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Assignees</h3>
              {editingSection !== 'assignees' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => startEditing('assignees', task.assigned_to ? (Array.isArray(task.assigned_to) ? task.assigned_to.map((u: any) => typeof u === 'object' ? u.id : u) : []) : [])}
                  className="h-6 w-6 p-0"
                >
                  <Pen className="w-3 h-3 text-gray-500" />
                </Button>
              )}
            </div>
            <Separator className="mb-4" />
            
            {editingSection === 'assignees' ? (
              <div className="space-y-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between h-10 px-3 rounded-lg border border-gray-200 bg-white/60 hover:bg-white/70 transition-all"
                      disabled={isSaving}
                    >
                      <span className="text-sm text-gray-700">
                        {editValue && editValue.length > 0
                          ? `${editValue.length} selected`
                          : "Select members..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0 border border-gray-200 shadow-lg rounded-lg overflow-hidden">
                    <Command className="bg-white/90 backdrop-blur-sm">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <CommandInput 
                          placeholder="Search members..." 
                          className="h-9 text-sm border-none focus:ring-0 bg-transparent placeholder:text-gray-400"
                        />
                      </div>
                      <CommandList className="max-h-[200px] overflow-y-auto">
                        <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                          No members found.
                        </CommandEmpty>
                        <CommandGroup className="p-1">
                          {projectMembers.map((member) => {
                            const fullName = `${member.user.first_name} ${member.user.last_name}`.trim();
                            const searchValue = `${fullName} ${member.user.email}`.toLowerCase();
                            return (
                              <CommandItem
                                key={member.user.id}
                                value={searchValue}
                                onSelect={() => toggleAssignee(Number(member.user.id))}
                                className="px-2 py-2 rounded-md cursor-pointer hover:bg-orange-50 aria-selected:bg-orange-50"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 text-orange-600",
                                    editValue.includes(Number(member.user.id))
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col flex-1 min-w-0">
                                  <span className="font-medium text-sm text-gray-900 truncate">
                                    {fullName || member.user.email}
                                  </span>
                                  {fullName && (
                                    <span className="text-xs text-gray-500 truncate">
                                      {member.user.email}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                <div className="flex flex-wrap gap-1">
                  {editValue.map((userId: number) => {
                    const member = projectMembers.find(m => Number(m.user.id) === userId);
                    if (!member) return null;
                    const fullName = `${member.user.first_name || ''} ${member.user.last_name || ''}`.trim();
                    const displayName = fullName || member.user.email?.split("@")[0] || "Unknown";
                    return (
                      <div key={userId} className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full text-xs text-orange-800 border border-orange-200">
                        <span>{displayName}</span>
                        <button onClick={() => toggleAssignee(userId)} className="text-orange-600 hover:text-red-600" disabled={isSaving}>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <Button size="sm" className="pm-button-secondary" onClick={cancelEditing} disabled={isSaving}>Cancel</Button>
                  <Button size="sm" className="pm-button-primary" onClick={handleAssigneesSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {task.assigned_to && Array.isArray(task.assigned_to) && task.assigned_to.length > 0 ? (
                  task.assigned_to.map((assignee: any) => {
                    // Handle both object and number types
                    if (typeof assignee === 'number') {
                      // If it's just an ID, try to find the member in projectMembers
                      const member = projectMembers.find(m => Number(m.user.id) === assignee);
                      if (member) {
                        assignee = member.user;
                      }
                    }
                    
                    const firstName = assignee?.first_name || '';
                    const lastName = assignee?.last_name || '';
                    const email = assignee?.email || '';
                    const username = assignee?.username || email.split('@')[0] || '';
                    
                    const fullName = `${firstName} ${lastName}`.trim();
                    const displayName = fullName || username || "Unknown";
                    
                    const initials = fullName 
                      ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
                      : email.charAt(0).toUpperCase() || "U";
                    
                    return (
                      <div key={assignee?.id || assignee} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-900 text-white text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {displayName}
                          </p>
                          {email && (
                            <p className="text-xs text-gray-500 truncate">
                              {email}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">Unassigned</p>
                )}
              </div>
            )}
          </div>

          {/* Related Tasks */}
          {task.related_work && task.related_work.length > 0 && (
            <div className="pm-card p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Related Tasks</h3>
              <Separator className="mb-4" />
              <div className="space-y-2">
                {task.related_work.map((relatedTask: any) => (
                  <Link
                    key={relatedTask.taskid}
                    href={`/projects/${task.Project}/task/${relatedTask.taskid}`}
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

        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteTask}
        isLoading={isDeleting}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.name}"? This action cannot be undone.`}
        itemName={task.name}
        confirmLabel="Delete Task"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default TaskViewComponent;
