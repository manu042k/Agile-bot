"use client";
import { useParams, usePathname } from "next/navigation";
import { Users, UserPlus, Mail, Crown, Shield, User, MoreVertical, Settings, FolderKanban } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock team data
const getMockTeam = (teamId: string) => ({
  id: teamId,
  name: "Development Team",
  description: "Responsible for developing and maintaining the application",
  members: [
    { id: 1, name: "John Doe", email: "john@example.com", role: "owner", avatar: null, joinedAt: "2024-01-10", tasks: 8, completed: 5 },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "admin", avatar: null, joinedAt: "2024-01-12", tasks: 6, completed: 4 },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "member", avatar: null, joinedAt: "2024-01-15", tasks: 5, completed: 2 },
    { id: 4, name: "Sarah Wilson", email: "sarah@example.com", role: "member", avatar: null, joinedAt: "2024-01-18", tasks: 4, completed: 3 },
    { id: 5, name: "Alex Brown", email: "alex@example.com", role: "member", avatar: null, joinedAt: "2024-01-20", tasks: 3, completed: 2 },
  ],
  pendingInvites: [
    { id: 1, email: "newmember@example.com", role: "member", invitedBy: "John Doe", invitedAt: "2024-02-10" },
  ],
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
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "admin":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const TeamMembersPage = () => {
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
        {/* Header with Actions */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Team Members</h2>
              <p className="text-gray-600">Manage team members and their roles</p>
            </div>
            <button className="pm-button-primary">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">{team.members.length}</p>
            <p className="text-xs text-gray-500 mt-1">Active Members</p>
          </div>
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">
              {team.members.reduce((sum, m) => sum + m.tasks, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
          </div>
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">
              {team.members.reduce((sum, m) => sum + m.completed, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Completed Tasks</p>
          </div>
        </div>

        {/* Team Members */}
        <div className="pm-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Members</h3>
            <span className="text-sm text-gray-500">{team.members.length} members</span>
          </div>
          <div className="space-y-3">
            {team.members.map((member) => {
              const RoleIcon = getRoleIcon(member.role);
              return (
                <div key={member.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar || undefined} alt={member.name} />
                    <AvatarFallback className="bg-gray-900 text-white font-medium">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border flex items-center gap-1 ${getRoleColor(member.role)}`}>
                        <RoleIcon className="h-3 w-3" />
                        {member.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Joined {member.joinedAt}</span>
                      <span>{member.tasks} tasks assigned</span>
                      <span>{member.completed} completed</span>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Invites */}
        {team.pendingInvites.length > 0 && (
          <div className="pm-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Invitations</h3>
            <div className="space-y-3">
              {team.pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{invite.email}</p>
                      <p className="text-xs text-gray-500">
                        Invited by {invite.invitedBy} on {invite.invitedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-700 border border-gray-300">
                      {invite.role}
                    </span>
                    <button className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembersPage;

