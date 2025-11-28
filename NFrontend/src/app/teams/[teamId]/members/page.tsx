"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Crown,
  Shield,
  User,
  MoreVertical,
  Settings,
  FolderKanban,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import InviteMemberComponent from "@/components/team/InviteMemberComponent";
import teamService from "@/services/teamService";
import { Team } from "@/types/project";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import CreateCard from "@/components/common/CreateCard";

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

const TeamMembersPage = () => {
  const params = useParams();
  const teamId = params.teamId as string;
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useUser();

  // Fetch team data function
  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      const teamData = await teamService.getTeam(teamId);
      setTeam(teamData);
    } catch (err: any) {
      console.error("Failed to fetch team:", err);
      setError(err.message || "Failed to load team");
      toast.error("Failed to load team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch team data on mount
  useEffect(() => {
    if (teamId) {
      fetchTeam();
    }
  }, [teamId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="pm-card p-6 text-center max-w-md">
          <p className="text-red-600 mb-4">{error || "Team not found"}</p>
          <Link
            href="/teams"
            className="pm-button-primary inline-flex items-center gap-2"
          >
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  // Check if current user is admin or owner
  const currentUserMembership = team?.members.find(
    (member) => member.user?.id === currentUser?.id
  );
  const isAdmin =
    currentUserMembership?.role === "admin" ||
    currentUserMembership?.role === "owner";

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={team.name}
        description={team.description || "No description"}
        icon={Users}
        tabs={[
          { icon: Users, label: "Overview", href: `/teams/${teamId}` },
          { icon: Users, label: "Members", href: `/teams/${teamId}/members` },
          {
            icon: FolderKanban,
            label: "Projects",
            href: `/teams/${teamId}/projects`,
          },
          {
            icon: Settings,
            label: "Settings",
            href: `/teams/${teamId}/settings`,
          },
        ]}
      />

      {/* Main Content */}
      <div className="px-6 py-8">
        {/* Invite Member Card and Stats */}
        <div
          className={`grid grid-cols-1 ${
            isAdmin ? "md:grid-cols-4" : "md:grid-cols-3"
          } gap-4 mb-6`}
        >
          {/* Invite Member Card - Only visible for admins */}
          {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <CreateCard
                  title="Invite Member"
                  description="Add to team"
                  icon={UserPlus}
                />
              </DialogTrigger>
              <InviteMemberComponent
                teamId={teamId}
                onMemberInvited={fetchTeam}
              />
            </Dialog>
          )}

          {/* Stats */}
          <StatCard
            icon={Users}
            value={team.members.length}
            label="Active Members"
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
          <StatCard
            icon={Shield}
            value={
                team.members.filter(
                  (m) => m.role === "owner" || m.role === "admin"
                ).length
              }
            label="Admins"
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
          <StatCard
            icon={User}
            value={team.members.filter((m) => m.role === "member").length}
            label="Members"
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
        </div>

        {/* Team Members */}
        <div className="pm-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Active Members
            </h3>
            <span className="text-sm text-gray-500">
              {team.members.length} members
            </span>
          </div>
          <Separator className="my-4" />
          <div className="space-y-3">
            {team.members.length > 0 ? (
              team.members.map((member) => {
                const RoleIcon = getRoleIcon(member.role);
                const userName =
                  member.user?.first_name && member.user?.last_name
                    ? `${member.user.first_name} ${member.user.last_name}`
                    : member.user?.email || "Unknown User";
                const userEmail = member.user?.email || "";
                const initials = userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2);
                const joinedDate = member.joined_at
                  ? new Date(member.joined_at).toLocaleDateString()
                  : "N/A";

                return (
                  <div
                    key={member.id || member.user?.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={
                          member.user?.avatar_url || member.user?.profile_pic
                        }
                        alt={userName}
                      />
                      <AvatarFallback className="bg-gray-900 text-white font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {userName}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium border flex items-center gap-1 ${getRoleColor(
                            member.role
                          )}`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {member.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {userEmail}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Joined {joinedDate}</span>
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
                <p className="text-sm">No members yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Invites - TODO: Implement when invitation API is available */}
      </div>
    </div>
  );
};

export default TeamMembersPage;
