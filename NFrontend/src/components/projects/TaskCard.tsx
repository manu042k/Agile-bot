"use client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import TaskViewComponent from "./TaskViewComponent";
import { User, Calendar, Flag, GripVertical } from "lucide-react";
import { Task, TaskPriority } from "@/types/project";
import { getStatusLabel, getStatusDotClass, getStatusBadgeClass } from "@/lib/statusUtils";
import { getAssigneeNames, formatDate, formatPriority } from "@/lib/taskUtils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskCardProps {
  task: Task;
  projectId: string;
  compact?: boolean;
  draggable?: boolean;
  onUpdate?: (updatedTask: Task) => void;
  onDelete?: (taskId: string) => void;
}

export default function TaskCard({
  task,
  projectId,
  compact = false,
  draggable = false,
  onUpdate,
  onDelete,
}: TaskCardProps) {
  const router = useRouter();
  const [localTask, setLocalTask] = useState(task);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Sync localTask when task prop changes
  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = draggable
    ? useSortable({
        id: task.taskid,
        data: {
          type: "task",
          task: localTask,
        },
      })
    : { attributes: {}, listeners: {}, setNodeRef: null, transform: null, transition: null, isDragging: false };

  const style = draggable && transform
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }
    : {};

  const handleTaskUpdate = (updatedTask: Task) => {
    setLocalTask(updatedTask);
    if (onUpdate) {
      onUpdate(updatedTask);
    }
    router.refresh();
  };

  const handleTaskDelete = () => {
    // Close the dialog
    setIsDialogOpen(false);
    
    // Notify parent to remove the task card
    if (onDelete) {
      onDelete(task.taskid);
    }
    
    // Refresh the page
    router.refresh();
  };

  const cardContent = (
    <div
      ref={draggable ? setNodeRef : undefined}
      style={style}
      className={`pm-card p-4 hover:shadow-lg transition-all flex flex-col relative group ${
        draggable ? "" : "cursor-pointer"
      } min-h-[160px]`}
    >
      {/* Drag Handle - Only visible on hover */}
      {draggable && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-3 right-3 cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/50 rounded transition-all opacity-0 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-gray-500" />
        </div>
      )}
      
      {/* Header with Status Dot */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`pm-status-dot ${getStatusDotClass(
            localTask.status
          )} flex-shrink-0`}
        />
        <div className="flex-1" />
      </div>
      
      {/* Task Title */}
      <h3 className="font-semibold text-gray-900 mb-4 line-clamp-2 text-base leading-snug flex-1">
        {localTask.name || "Untitled Task"}
      </h3>
      
      {/* Footer Section */}
      <div className="space-y-3 mt-auto">
        {/* Status and Priority Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusBadgeClass(
              localTask.status
            )} whitespace-nowrap`}
          >
            {getStatusLabel(localTask.status)}
          </span>
          <span
            className={`pm-badge text-xs whitespace-nowrap inline-flex items-center gap-1 ${
              localTask.priority === TaskPriority.High
                ? "pm-priority-high"
                : localTask.priority === TaskPriority.Normal
                ? "pm-priority-medium"
                : "pm-priority-low"
            }`}
          >
            <Flag className="h-3 w-3" />
            {formatPriority(localTask.priority)}
          </span>
        </div>
        
        {/* Tags */}
        {localTask.tags && localTask.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {localTask.tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] bg-orange-100 text-orange-800 border border-orange-200 capitalize">
                {tag}
              </span>
            ))}
            {localTask.tags.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-600 border border-gray-200">
                +{localTask.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Assignees and Date Row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100/50">
          {/* Assignee Avatars */}
          {localTask.assigned_to && Array.isArray(localTask.assigned_to) && localTask.assigned_to.length > 0 ? (
            <TooltipProvider>
              <div className="flex -space-x-2">
                {localTask.assigned_to.slice(0, 3).map((assignee: any, index: number) => {
                  const email = typeof assignee === 'object' ? assignee.email : '';
                  const username = typeof assignee === 'object' ? assignee.username : '';
                  const firstName = typeof assignee === 'object' ? assignee.first_name : '';
                  const lastName = typeof assignee === 'object' ? assignee.last_name : '';
                  
                  const fullName = `${firstName} ${lastName}`.trim();
                  const displayName = fullName || username || email.split('@')[0] || 'User';
                  const initials = fullName 
                    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
                    : email.charAt(0).toUpperCase() || 'U';
                  
                  return (
                    <Tooltip key={assignee.id || index}>
                      <TooltipTrigger asChild>
                        <Avatar className="h-7 w-7 border-2 border-white shadow-sm hover:scale-110 transition-transform">
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-[10px] font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p className="font-medium">{displayName}</p>
                        {email && <p className="text-[10px] text-gray-400">{email}</p>}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                {localTask.assigned_to.length > 3 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-7 w-7 border-2 border-white shadow-sm hover:scale-110 transition-transform">
                        <AvatarFallback className="bg-gray-100 text-gray-700 text-[10px] font-semibold">
                          +{localTask.assigned_to.length - 3}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <p>{localTask.assigned_to.length - 3} more assignee{localTask.assigned_to.length - 3 > 1 ? 's' : ''}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
          ) : (
            <div className="flex items-center gap-1.5 text-gray-400">
              <User className="h-3.5 w-3.5" />
              <span className="text-xs">Unassigned</span>
            </div>
          )}
          
          {/* Date */}
          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs whitespace-nowrap">
              {formatDate(localTask.updated_at || localTask.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {cardContent}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl h-auto max-h-[90vh] overflow-auto">
        <TaskViewComponent 
          task={localTask} 
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      </DialogContent>
    </Dialog>
  );
}

