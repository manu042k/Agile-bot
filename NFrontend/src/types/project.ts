import { User } from "./user";

export enum ProjectVisibility {
  Public = "public",
  Private = "private",
}
export enum TeamMemberRole {
  Member = "member",
  Admin = "admin",
}
export interface Project {
  id: number;
  name: string;
  description: string;
  visibility: ProjectVisibility;
  team: Team;
  created_by?: User;
}

export interface TeamMember {
  id: string;
  user: User;
  role: TeamMemberRole;
  joined_at: string;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  members: TeamMember[];
  created_at: string;
  updated_at: string;
}

export interface ProjectDTO {
  name: string;
  description: string;
  visibility: ProjectVisibility;
  team: string;
}

export interface UpadtedProjectDTO {
  id: string;
  name: string;
  description: string;
  visibility: ProjectVisibility;
  team: string;
}

export interface TeamDTO {
  name: string;
  description: string;
}

export interface ProjectItem {
  project: string;
  timeline: string;
  sprintsize: number;
  file: string | File;
  created_at: string;
  updated_at: string;
}

export enum TaskStatus {
  Created = "created",
  Completed = "completed",
  Active = "active",
  Backlog = "backlog",
}

export enum TaskPriority {
  Normal = "normal",
  Low = "low",
  High = "high",
}

export enum TaskSize {
  Small = "s",
  Medium = "m",
  Large = "l",
  ExtraLarge = "xl",
}
export enum CreatedBy {
  AI = "ai",
  USER = "user",
}
export interface Comment {
  user: User;
  task: Task;
  content: string;
}
export interface Task {
  taskid: string;
  name: string;
  description: string;
  details: string;
  status: TaskStatus;
  priority: TaskPriority;
  size: TaskSize;
  assigned_to: User | null | string;
  comments: Comment[];
  related_work: Task[];
  Project: string;
  created_by: CreatedBy;
  created_at: string;
  updated_at: string;
  task_number: string;
}
