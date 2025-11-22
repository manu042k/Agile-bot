/**
 * Consistent color utility functions for status, priority, and roles
 * Use these functions throughout the application to ensure color consistency
 */

// Status color helpers
export const getStatusDotClass = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "done":
    case "completed":
      return "pm-status-done";
    case "in_progress":
    case "active":
    case "inprogress":
      return "pm-status-progress";
    case "todo":
    case "created":
      return "pm-status-todo";
    case "backlog":
    default:
      return "pm-status-backlog";
  }
};

export const getStatusBadgeClass = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "done":
    case "completed":
      return "pm-status-badge-done";
    case "in_progress":
    case "active":
    case "inprogress":
      return "pm-status-badge-progress";
    case "todo":
    case "created":
      return "pm-status-badge-todo";
    case "backlog":
    default:
      return "pm-status-badge-backlog";
  }
};

// Priority color helpers
export const getPriorityClass = (priority: string): string => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "pm-priority-high";
    case "medium":
    case "normal":
      return "pm-priority-medium";
    case "low":
    default:
      return "pm-priority-low";
  }
};

// Role color helpers
export const getRoleClass = (role: string): string => {
  switch (role?.toLowerCase()) {
    case "owner":
      return "pm-role-owner";
    case "admin":
    case "administrator":
      return "pm-role-admin";
    case "member":
    default:
      return "pm-role-member";
  }
};

// Status column colors for Kanban boards
export const getStatusColumnColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "done":
    case "completed":
      return "bg-green-500";
    case "in_progress":
    case "active":
    case "inprogress":
      return "bg-amber-500";
    case "todo":
    case "created":
      return "bg-blue-500";
    case "backlog":
    default:
      return "bg-gray-400";
  }
};

// Project status color helpers (different from task statuses)
export const getProjectStatusBadgeClass = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "active":
      return "pm-project-status-active";
    case "completed":
      return "pm-project-status-completed";
    case "planning":
      return "pm-project-status-planning";
    default:
      return "pm-project-status-planning";
  }
};

export const getProjectStatusDotClass = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "active":
      return "pm-project-status-dot-active";
    case "completed":
      return "pm-project-status-dot-completed";
    case "planning":
      return "pm-project-status-dot-planning";
    default:
      return "pm-project-status-dot-planning";
  }
};

