"use client";
import { useParams, usePathname } from "next/navigation";
import { Users, FolderKanban, Settings, UserPlus, Mail, Crown, Shield, User, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock team data
const getMockTeam = (teamId: string) => ({
  id: teamId,
  name: "Development Team",
  description: "Responsible for developing and maintaining the application",
  members: [
    { id: 1, name: "John Doe", email: "john@example.com", role: "owner", avatar: null, joinedAt: "2024-01-10" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "admin", avatar: null, joinedAt: "2024-01-12" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "member", avatar: null, joinedAt: "2024-01-15" },
    { id: 4, name: "Sarah Wilson", email: "sarah@example.com", role: "member", avatar: null, joinedAt: "2024-01-18" },
    { id: 5, name: "Alex Brown", email: "alex@example.com", role: "member", avatar: null, joinedAt: "2024-01-20" },
  ],
  projects: [
    { id: 1, name: "E-Commerce Platform", progress: 65, tasks: 24 },
    { id: 2, name: "Mobile Banking App", progress: 42, tasks: 18 },
    { id: 3, name: "AI Analytics Dashboard", progress: 78, tasks: 45 },
  ],
  created: "2024-01-10",
});

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
  const team = getMockTeam(teamId);

  const navItems = [
    { icon: Users, label: "Overview", href: `/teams/${teamId}` },
    { icon: Users, label: "Members", href: `/teams/${teamId}/members` },
    { icon: FolderKanban, label: "Projects", href: `/teams/${teamId}/projects` },
    { icon: Settings, label: "Settings", href: `/teams/${teamId}/settings` },
  ].map(item => ({
    ...item,
    active: pathname === item.href || (item.href === `/teams/${teamId}` && pathname === `/teams/${teamId}`)
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Team Header with Tabs */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                {team.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{team.name}</h1>
              <p className="text-gray-600 leading-relaxed">{team.description}</p>
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
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
                <p className="text-2xl font-semibold text-gray-900">{team.members.length}</p>
                <p className="text-xs text-gray-500 mt-1">Members</p>
              </div>
              <div className="pm-card p-5">
                <p className="text-2xl font-semibold text-gray-900">{team.projects.length}</p>
                <p className="text-xs text-gray-500 mt-1">Projects</p>
              </div>
              <div className="pm-card p-5">
                <p className="text-2xl font-semibold text-gray-900">
                  {team.projects.reduce((sum, p) => sum + p.tasks, 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">John Doe</span> completed task "Implement user authentication"
                      </p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                ))}
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
                  <p className="text-sm font-medium text-gray-900">{team.created}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Members</p>
                  <p className="text-sm font-medium text-gray-900">{team.members.length} active</p>
                </div>
              </div>
            </div>

            {/* Team Members Preview */}
            <div className="pm-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Team Members</h3>
                <Link href={`/teams/${teamId}/members`} className="text-xs text-gray-600 hover:text-gray-900">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {team.members.slice(0, 3).map((member) => {
                  const RoleIcon = getRoleIcon(member.role);
                  return (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-900 text-white text-xs">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border flex items-center gap-1 ${getRoleColor(member.role)}`}>
                        <RoleIcon className="h-3 w-3" />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team Projects Preview */}
            <div className="pm-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Projects</h3>
                <Link href={`/teams/${teamId}/projects`} className="text-xs text-gray-600 hover:text-gray-900">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {team.projects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{project.name}</h4>
                        <span className="text-xs font-medium text-gray-700">{project.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-900 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailPage;

