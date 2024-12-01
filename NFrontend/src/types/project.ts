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
