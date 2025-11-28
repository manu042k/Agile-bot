"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { UserPlus, MoreVertical, Mail, User, Shield, Crown, Settings, Loader2, Users, Link2, Archive, AlertTriangle, CheckSquare, CheckCircle2 } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ProjectHeader from "@/components/projects/ProjectHeader";
import InviteMemberComponent from "@/components/team/InviteMemberComponent";
import { Separator } from "@/components/ui/separator";
import StatCard from "@/components/common/StatCard";
import CreateCard from "@/components/common/CreateCard";
import projectService from "@/services/projectService";
import taskService from "@/services/taskService";
import teamService from "@/services/teamService";
import { Project, Task, TaskStatus, TeamMember, Team } from "@/types/project";
import { useUser } from "@/hooks/useUser";
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
  const router = useRouter();
  const projectId = params.projectId as string;
  const { user: currentUser } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [membersWithStats, setMembersWithStats] = useState<MemberWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Check if current user is project creator
  const isProjectCreator = () => {
    if (!currentUser || !project) return false;
    
    if (project.created_by?.id && currentUser.id) {
      const createdById = String(project.created_by.id);
      const userId = String(currentUser.id);
      return createdById === userId;
    }
    
    return false;
  };

  // Check if current user is team admin/owner (for invite member functionality)
  const isTeamAdmin = () => {
    if (!currentUser || !project || !project.team) return false;
    
    // Only check if user is admin or owner in the team
    if (project.team.members) {
      const currentUserMembership = project.team.members.find(
        (member) => member.user?.id && String(member.user.id) === String(currentUser.id)
      );
      return (
        currentUserMembership?.role === "admin" ||
        currentUserMembership?.role === "owner"
      );
    }
    
    return false;
  };

  // Check if user can invite members (project creator or team admin/owner)
  const canInviteMember = () => {
    return isProjectCreator() || isTeamAdmin();
  };

  // Check if user can assign team (project creator or team admin)
  const canAssignTeam = () => {
    return isProjectCreator() || isTeamAdmin();
  };

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const [projectData, teamsData] = await Promise.all([
          projectService.getProject(projectId),
          teamService.getTeams(),
        ]);
        
        setProject(projectData);
        // Filter out archived teams from selection
        setTeams(teamsData.filter(team => !team.is_archived));
        
        // Set selected team if project has one
        if (projectData.team) {
          setSelectedTeamId(projectData.team.id.toString());
        }

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

  const handleAssignTeam = async () => {
    if (!selectedTeamId) {
      toast.error("Please select a team");
      return;
    }

    try {
      setIsAssigning(true);
      await projectService.assginTeam({
        project_id: parseInt(projectId),
        team_id: parseInt(selectedTeamId),
      });
      toast.success("Team assigned successfully!");
      setIsAssignDialogOpen(false);
      // Refresh the page data
      const projectData = await projectService.getProject(projectId);
      setProject(projectData);
      if (projectData.team) {
        setSelectedTeamId(projectData.team.id.toString());
        // Fetch tasks and update member stats
        const tasks = await taskService.getTasks(projectId);
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
      }
    } catch (err: any) {
      console.error("Error assigning team:", err);
      toast.error(err.response?.data?.error || "Failed to assign team. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

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
        {/* Archived Team Warning */}
        {project.team?.is_archived && (
          <div className="mb-6 pm-card p-4 border-orange-200 bg-orange-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-orange-900 mb-1">Team Archived</p>
                <p className="text-sm text-orange-700">
                  This team has been archived. Team management features are disabled. 
                  You can still view team information, but cannot add members or make changes.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Team</h1>
              <p className="text-gray-600">Manage team members and their roles</p>
          </div>
        </div>

        {!project.team ? (
          /* No Team Assigned */
          <div className="pm-card p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">No team assigned</p>
            <p className="text-sm text-gray-500 mb-6">This project doesn't have a team associated with it yet</p>
            {canAssignTeam() && (
              <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogTrigger asChild>
                  <button className="pm-button-primary inline-flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Assign Team
                  </button>
                </DialogTrigger>
              <DialogContent>
                <DialogTitle>Assign Team to Project</DialogTitle>
                <DialogDescription>
                  Select a team to assign to this project. You can manage team members after assignment.
                </DialogDescription>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Select Team
                    </label>
                    <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.length > 0 ? (
                          teams.map((team) => (
                            <SelectItem key={team.id} value={team.id.toString()}>
                              {team.name}
                              {team.members && (
                                <span className="text-xs text-gray-500 ml-2">
                                  ({team.members.length} members)
                                </span>
                              )}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-gray-500">
                            No teams available. Create a team first.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAssignDialogOpen(false)}
                      disabled={isAssigning}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAssignTeam} disabled={isAssigning || !selectedTeamId}>
                      {isAssigning ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Assigning...
                        </>
                      ) : (
                        "Assign Team"
                      )}
                    </Button>
                  </div>
                </div>
                  </DialogContent>
                </Dialog>
              )}
          </div>
        ) : (
          <>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {project.team && canInviteMember() && !project.team.is_archived ? (
            <Dialog>
              <DialogTrigger asChild>
                <CreateCard
                  title="Invite Member"
                  description="Add team member"
                  icon={UserPlus}
                />
              </DialogTrigger>
              <InviteMemberComponent teamId={project.team.id.toString()} />
            </Dialog>
          ) : null}
          <StatCard
            icon={Users}
            value={membersWithStats.length}
            label="Team Members"
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={CheckSquare}
            value={membersWithStats.reduce((sum, m) => sum + m.tasks, 0)}
            label="Total Tasks"
            iconBgColor="bg-gray-100"
            iconColor="text-gray-700"
          />
          <StatCard
            icon={CheckCircle2}
            value={membersWithStats.reduce((sum, m) => sum + m.completed, 0)}
            label="Completed Tasks"
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
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

