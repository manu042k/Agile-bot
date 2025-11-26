"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { UserPlus, MoreVertical, Mail, User, Shield, Crown, Settings, Loader2, Users } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProjectHeader from "@/components/projects/ProjectHeader";
import InviteMemberComponent from "@/components/team/InviteMemberComponent";
import { Separator } from "@/components/ui/separator";
import projectService from "@/services/projectService";
import taskService from "@/services/taskService";
import { Project, Task, TaskStatus, TeamMember } from "@/types/project";
import toast from "react-hot-toast";

const getRoleIcon = (role: string) => {
  switch (role) {
    case "owner":
      return Crown;
    case "admin":
      return Shield;
    default:
      return User;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "owner":
      return "pm-role-owner";
    case "admin":
      return "pm-role-admin";
    default:
      return "pm-role-member";
  }
};

interface MemberWithStats extends TeamMember {
  tasks: number;
  completed: number;
}

const ProjectTeamPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [membersWithStats, setMembersWithStats] = useState<MemberWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const projectData = await projectService.getProject(projectId);
        setProject(projectData);

        // Check if project has a team
        if (!projectData.team || !projectData.team.members) {
          setMembersWithStats([]);
          setError(null);
          setLoading(false);
          return;
        }

        // Fetch all tasks for the project
        const tasks = await taskService.getTasks(projectId);

        // Calculate task stats for each member
        const membersWithTaskStats: MemberWithStats[] = projectData.team.members.map((member) => {
          const memberTasks = tasks.filter((task: Task) => 
            Array.isArray(task.assigned_to) && 
            task.assigned_to.some((assignee: any) => assignee?.id === member.user?.id)
          );
          const completedTasks = memberTasks.filter((task: Task) => task.status === TaskStatus.Completed);

          return {
            ...member,
            tasks: memberTasks.length,
            completed: completedTasks.length,
          };
        });

        setMembersWithStats(membersWithTaskStats);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching team data:", err);
        setError(err.message || "Failed to fetch team data");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading team...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="px-6 py-8">
          <div className="pm-card p-8 text-center border-red-200 bg-red-50">
            <p className="text-red-600 font-medium mb-2">Failed to load team</p>
            <p className="text-sm text-red-500">{error || "Project not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader />
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Team</h1>
              <p className="text-gray-600">Manage team members and their roles</p>
            </div>
            {project.team && (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="pm-button-primary inline-flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Invite Member
                  </button>
                </DialogTrigger>
                <InviteMemberComponent teamId={project.team.id.toString()} />
              </Dialog>
            )}
          </div>
        </div>

        {!project.team ? (
          /* No Team Assigned */
          <div className="pm-card p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">No team assigned</p>
            <p className="text-sm text-gray-500">This project doesn't have a team associated with it yet</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="pm-card p-5">
                <p className="text-2xl font-semibold text-gray-900">{membersWithStats.length}</p>
                <p className="text-xs text-gray-500 mt-1">Team Members</p>
              </div>
              <div className="pm-card p-5">
                <p className="text-2xl font-semibold text-gray-900">
                  {membersWithStats.reduce((sum, m) => sum + m.tasks, 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
              </div>
              <div className="pm-card p-5">
                <p className="text-2xl font-semibold text-gray-900">
                  {membersWithStats.reduce((sum, m) => sum + m.completed, 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Completed Tasks</p>
              </div>
            </div>

            {/* Team Members */}
            <div className="pm-card p-6 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Active Members</h2>
                <span className="text-sm text-gray-500">{membersWithStats.length} members</span>
              </div>
              <Separator className="my-4" />
              <div className="space-y-3">
                {membersWithStats.length > 0 ? (
                  membersWithStats.map((member) => {
                    const RoleIcon = getRoleIcon(member.role);
                    const userName = member.user?.email?.split('@')[0] || "Unknown";
                    return (
                      <div key={member.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gray-900 text-white font-medium">
                            {member.user?.email?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{userName}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border flex items-center gap-1 ${getRoleColor(member.role)}`}>
                              <RoleIcon className="h-3 w-3" />
                              {member.role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.user?.email || "No email"}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{member.tasks} tasks assigned</span>
                            <span>{member.completed} completed</span>
                          </div>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No team members found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pending Invites - TODO: Add API endpoint for team invitations */}

            {/* Workload View */}
            <div className="pm-card p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Workload Distribution</h2>
              <Separator className="my-4" />
              <div className="space-y-4">
                {membersWithStats.length > 0 ? (
                  membersWithStats.map((member) => {
                    const completionRate = member.tasks > 0 ? (member.completed / member.tasks) * 100 : 0;
                    const userName = member.user?.email?.split('@')[0] || "Unknown";
                    return (
                      <div key={member.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gray-900 text-white text-xs">
                                {member.user?.email?.charAt(0).toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{userName}</p>
                              <p className="text-xs text-gray-500">{member.tasks} tasks</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{Math.round(completionRate)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-600 rounded-full transition-all"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No workload data available</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectTeamPage;

