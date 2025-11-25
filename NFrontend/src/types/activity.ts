export interface Activity {
  id: number;
  activity_type: string;
  user: {
    id: number;
    email: string;
    phone_number?: string;
    is_active: boolean;
    is_staff: boolean;
    date_joined: string;
  } | null;
  user_email: string;
  project: number | null;
  project_name: string | null;
  task: string | null;
  task_number: string | null;
  description: string;
  target_name: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface ActivityListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Activity[];
}

export type ActivityType =
  | "task_created"
  | "task_updated"
  | "task_completed"
  | "task_assigned"
  | "task_deleted"
  | "comment_added"
  | "project_created"
  | "project_updated"
  | "project_deleted"
  | "document_uploaded"
  | "member_added"
  | "member_removed"
  | "team_created"
  | "team_updated";

