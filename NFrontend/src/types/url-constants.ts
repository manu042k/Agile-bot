export enum URLS {
  BASE_URL = "http://localhost:8000/",
  USER_INFO = "api/accounts/user/info/",
  USERS = "api/accounts/users/",
  USER_DETAIL = "api/accounts/users/", // Append user ID
  ADD_MEMBER = "/add-member/",
  INVITE_MEMBER = "/invite/",
  REMOVE_MEMBER = "/remove-member/",
  UPDATE_MEMBER_ROLE = "/members/", // Append team_id/members/user_id
  ACCEPT_INVITATION = "api/accounts/invitations/accept/",
  // Google OAuth endpoints
  GOOGLE_LOGIN = "api/accounts/auth/google/login/",
  GOOGLE_CALLBACK = "api/accounts/auth/google/callback/",
  GOOGLE_SYNC = "api/accounts/auth/google/sync/",
  LOGOUT = "api/accounts/auth/logout/",
  USER_ME = "api/accounts/auth/me/",
  // Legacy endpoints (kept for backward compatibility)
  LOGIN = "api/accounts/login/",
  REGISTER = "api/accounts/register/",
  PROJECTS = "api/project-management/projects/",
  ASSIGN_TEAM = "assign-team/",
  TEAMS = "api/accounts/teams/",
  PROJECTS_UPLOAD = "api/project-management/upload/",
  PROJECTS_VIEW = "api/project-management/view/",
  TASK = "api/project-management/tasks/",
  TASKS_BY_PROJECT = "api/project-management/projects/",
  TASKS_PATCH = "api/project-management/tasks-patch/",
  TASK_TRIGGER = "api/project-management/trigger/",
  PROJECT_TIMELINE = "api/project-management/projects/", // Append project_id/timeline/
}
