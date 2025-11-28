import { TaskStatus } from "@/types/project";

/**
 * Get the display label for a task status
 */
export const getStatusLabel = (status: string): string => {
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case TaskStatus.Completed:
      return "Done";
    case TaskStatus.Active:
      return "In Progress";
    case TaskStatus.Created:
      return "Created";
    case TaskStatus.Backlog:
      return "Backlog";
    default:
      return "Backlog";
  }
};

/**
 * Get the CSS class for status dot indicator
 */
export const getStatusDotClass = (status: string): string => {
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case TaskStatus.Completed:
      return "pm-status-done";
    case TaskStatus.Active:
      return "pm-status-progress";
    case TaskStatus.Created:
      return "pm-status-todo";
    case TaskStatus.Backlog:
      return "pm-status-backlog";
    default:
      return "pm-status-backlog";
  }
};

/**
 * Get the CSS classes for status badge
 */
export const getStatusBadgeClass = (status: string): string => {
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case TaskStatus.Completed:
      return "bg-green-100 text-green-700 border-green-300";
    case TaskStatus.Active:
      return "bg-blue-100 text-blue-700 border-blue-300";
    case TaskStatus.Created:
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case TaskStatus.Backlog:
      return "bg-gray-100 text-gray-700 border-gray-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

/**
 * Normalize status value to match TaskStatus enum
 * Handles legacy values like "done", "in_progress", "todo"
 */
export const normalizeStatus = (status: string): TaskStatus => {
  const normalizedStatus = status.toLowerCase();
  
  // Handle legacy values
  if (normalizedStatus === "done") return TaskStatus.Completed;
  if (normalizedStatus === "in_progress") return TaskStatus.Active;
  if (normalizedStatus === "todo") return TaskStatus.Created;
  
  // Return as-is if it matches enum values
  if (Object.values(TaskStatus).includes(normalizedStatus as TaskStatus)) {
    return normalizedStatus as TaskStatus;
  }
  
  // Default to backlog
  return TaskStatus.Backlog;
};

/**
 * Check if two status values are equal (handles normalization)
 */
export const isStatusEqual = (status1: string, status2: string): boolean => {
  return normalizeStatus(status1) === normalizeStatus(status2);
};

