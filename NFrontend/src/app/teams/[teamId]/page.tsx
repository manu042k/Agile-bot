"use client";
import { useParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Users,
  FolderKanban,
  Settings,
  Crown,
  Shield,
  User,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import teamService from "@/services/teamService";
import projectService from "@/services/projectService";
import { Team, Project } from "@/types/project";
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

const TeamDetailPage = () => {
  const params = useParams();
  const pathname = usePathname();
  const teamId = params.teamId as string;
  const [team, setTeam] = useState<Team | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch team data
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch team details
        const teamData = await teamService.getTeam(teamId);
        setTeam(teamData);

        // Fetch all projects and filter by team
        try {
          const allProjects = await projectService.getProjects();
          const teamProjects = allProjects.filter(p => p.team?.id === teamData.id);
          setProjects(teamProjects);
        } catch (err) {
          console.error("Failed to fetch projects:", err);
          setProjects([]);
        }
      } catch (err: any) {
        console.error("Failed to fetch team:", err);
        setError(err.message || "Failed to load team");
        toast.error("Failed to load team. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading team...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="pm-card p-6 text-center max-w-md">
          <p className="text-red-600 mb-4">{error || "Team not found"}</p>
          <Link href="/teams" className="pm-button-primary inline-flex items-center gap-2">
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  // Generate team avatar initials
  const getTeamAvatar = (name: string) => {
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { icon: Users, label: "Overview", href: `/teams/${teamId}` },
    { icon: Users, label: "Members", href: `/teams/${teamId}/members` },
    {
      icon: FolderKanban,
      label: "Projects",
      href: `/teams/${teamId}/projects`,
    },
    { icon: Settings, label: "Settings", href: `/teams/${teamId}/settings` },
  ].map((item) => ({
    ...item,
    active:
      pathname === item.href ||
      (item.href === `/teams/${teamId}` && pathname === `/teams/${teamId}`),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Team Header with Tabs */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {getTeamAvatar(team.name)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {team.name}
              </h1>
              <p className="text-gray-600 leading-relaxed">
                {team.description || "No description"}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    item.active
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="pm-card p-5">
                <p className="text-2xl font-semibold text-gray-900">
                  {team.members.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Members</p>
              </div>
              <div className="pm-card p-5">
                <p className="text-2xl font-semibold text-gray-900">
                  {projects.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Projects</p>
              </div>
              <div className="pm-card p-5">
                <p className="text-2xl font-semibold text-gray-900">
                  {projects.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active Projects</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="space-y-3">
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No recent activity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Details */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Team Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {team.created_at ? new Date(team.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Members</p>
                  <p className="text-sm font-medium text-gray-900">
                    {team.members.length} active
                  </p>
                </div>
              </div>
            </div>

            {/* Team Members Preview */}
            <div className="pm-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Team Members</h3>
                <Link
                  href={`/teams/${teamId}/members`}
                  className="text-xs text-gray-600 hover:text-gray-900"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {team.members.length > 0 ? (
                  team.members.slice(0, 3).map((member) => {
                    const RoleIcon = getRoleIcon(member.role);
                    const userName = member.user?.first_name && member.user?.last_name
                      ? `${member.user.first_name} ${member.user.last_name}`
                      : member.user?.email || "Unknown User";
                    const userEmail = member.user?.email || "";
                    const initials = userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2);
                    
                    return (
                      <div key={member.id || member.user?.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user?.avatar_url || member.user?.profile_pic} />
                          <AvatarFallback className="bg-gray-900 text-white text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {userName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {userEmail}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium border flex items-center gap-1 ${getRoleColor(
                            member.role
                          )}`}
                        >
                          <RoleIcon className="h-3 w-3" />
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No members yet
                  </p>
                )}
              </div>
            </div>

            {/* Team Projects Preview */}
            <div className="pm-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Projects</h3>
                <Link
                  href={`/teams/${teamId}/projects`}
                  className="text-xs text-gray-600 hover:text-gray-900"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {projects.length > 0 ? (
                  projects.slice(0, 3).map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <div className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {project.name}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {project.description || "No description"}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No projects yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailPage;
