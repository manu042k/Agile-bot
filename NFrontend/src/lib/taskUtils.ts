import { Task } from "@/types/project";

/**
 * Get formatted assignee names from a task
 */
export const getAssigneeNames = (task: Task): string => {
  if (!task.assigned_to || !Array.isArray(task.assigned_to))
    return "Unassigned";
  if (task.assigned_to.length === 0) return "Unassigned";
  return task.assigned_to
    .map((u: any) => u?.email?.split("@")[0] || "Unknown")
    .join(", ");
};

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string): string => {
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

/**
 * Format priority string to capitalized format
 */
export const formatPriority = (priority: string): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
};

