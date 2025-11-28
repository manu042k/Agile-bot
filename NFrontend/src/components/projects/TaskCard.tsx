"use client";
import Link from "next/link";
import { User, Calendar, Flag, GripVertical } from "lucide-react";
import { Task, TaskPriority } from "@/types/project";
import { getStatusLabel, getStatusDotClass, getStatusBadgeClass } from "@/lib/statusUtils";
import { getAssigneeNames, formatDate, formatPriority } from "@/lib/taskUtils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskCardProps {
  task: Task;
  projectId: string;
  compact?: boolean;
  draggable?: boolean;
}

export default function TaskCard({
  task,
  projectId,
  compact = false,
  draggable = false,
}: TaskCardProps) {
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
          task,
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

  // Trim description to fixed length
  const getTrimmedDescription = (text: string | null | undefined, maxLength: number = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const description = getTrimmedDescription(task.description || task.details, 100);

  const cardContent = (
    <div
      ref={draggable ? setNodeRef : undefined}
      style={style}
      className={`pm-card p-4 hover:shadow-md transition-all flex flex-col ${
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      } ${compact ? "h-[200px]" : "h-[200px]"}`}
    >
      <div className="flex items-start mb-3">
        {draggable && (
          <div
            {...attributes}
            {...listeners}
            className="mt-1 mr-2 cursor-grab active:cursor-grabbing flex-shrink-0"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <div
          className={`pm-status-dot ${getStatusDotClass(
            task.status
          )} flex-shrink-0`}
        />
      </div>
      <h3
        className={`font-semibold text-gray-900 mb-2 line-clamp-2 text-sm min-h-[2.5rem]`}
      >
        {task.name || "Untitled Task"}
      </h3>
      {description && (
        <p
          className={`text-gray-600 mb-3 line-clamp-2 text-xs flex-shrink-0`}
        >
          {description}
        </p>
      )}
      <div
        className={`mt-auto space-y-2 pt-3 border-t border-gray-100`}
      >
        {/* Status and Priority Tags in Single Row */}
        <div className="flex items-center gap-2 flex-nowrap overflow-hidden">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadgeClass(
              task.status
            )} whitespace-nowrap flex-shrink-0`}
          >
            {getStatusLabel(task.status)}
          </span>
          <span
            className={`pm-badge text-xs whitespace-nowrap flex-shrink-0 inline-flex items-center ${
              task.priority === TaskPriority.High
                ? "pm-priority-high"
                : task.priority === TaskPriority.Normal
                ? "pm-priority-medium"
                : "pm-priority-low"
            }`}
          >
            <Flag className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="whitespace-nowrap">
              {formatPriority(task.priority)}
            </span>
          </span>
        </div>
        {/* User Assignment and Date */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span
            className="flex items-center gap-1 flex-1 min-w-0"
            title="Click to assign users"
          >
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{getAssigneeNames(task)}</span>
          </span>
          <span className="flex items-center gap-1 flex-shrink-0">
            <Calendar className="h-3 w-3" />
            <span className="whitespace-nowrap">
              {formatDate(task.updated_at || task.created_at)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );

  if (draggable) {
    return cardContent;
  }

  return (
    <Link href={`/projects/${projectId}/task/${task.taskid}`}>
      {cardContent}
    </Link>
  );
}

