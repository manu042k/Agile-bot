"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CirclePlus,
  Users,
  Search,
  Loader2,
  User,
  FolderKanban,
} from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import CreateTeamComponent from "@/components/team/CreateTeamComponent";
import PageHeader from "@/components/common/PageHeader";
import teamService from "@/services/teamService";
import projectService from "@/services/projectService";
import { Team } from "@/types/project";
import { useUser } from "@/hooks/useUser";
import toast from "react-hot-toast";
import { Separator } from "@/components/ui/separator";
import ActivityFeed from "@/components/common/ActivityFeed";
import StatCard from "@/components/common/StatCard";
import CreateCard from "@/components/common/CreateCard";

const TeamsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectCounts, setProjectCounts] = useState<Record<number, number>>(
    {}
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user: currentUser } = useUser();

  // Fetch teams function
  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const teamsData = await teamService.getTeams();
      setTeams(teamsData);

      // Fetch all projects to calculate project counts per team
      try {
        const projects = await projectService.getProjects();
        const counts: Record<number, number> = {};
        teamsData.forEach((team) => {
          counts[team.id] = projects.filter(
            (p) => p.team?.id === team.id
          ).length;
        });
        setProjectCounts(counts);
      } catch (err) {
        console.error("Failed to fetch projects for counts:", err);
        // Set all counts to 0 if projects fetch fails
        const counts: Record<number, number> = {};
        teamsData.forEach((team) => {
          counts[team.id] = 0;
        });
        setProjectCounts(counts);
      }
    } catch (err: any) {
      console.error("Failed to fetch teams:", err);
      setError(err.message || "Failed to load teams");
      toast.error("Failed to load teams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch teams on mount
  useEffect(() => {
    fetchTeams();
  }, []);

  // Refresh teams list (can be called after creating a team)
  const refreshTeams = () => {
    setDialogOpen(false);
    fetchTeams();
  };

  // Filter teams based on search
  // Note: Backend already filters teams to only return teams where user is a member
  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false);

    return matchesSearch;
  });

  // Calculate stats
  // Note: Backend already filters teams to only return teams where user is a member
  // Count unique members across all teams
  const uniqueMemberIds = new Set<number | string>();
  teams.forEach((team) => {
    team.members.forEach((member) => {
      if (member.user?.id) {
        uniqueMemberIds.add(member.user.id as number | string);
      }
    });
  });
  const totalMembers = uniqueMemberIds.size;
  const totalProjects = Object.values(projectCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  // Generate avatar initials from team name
  const getTeamAvatar = (name: string) => {
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Teams"
          description="Manage your organization's teams and collaborate effectively"
          icon={Users}
          showTabs={false}
        />
        <div className="px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading teams...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Teams"
          description="Manage your organization's teams and collaborate effectively"
          icon={Users}
          showTabs={false}
        />
        <div className="px-6 py-8">
          <div className="pm-card p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="pm-button-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Teams"
        description="Manage your organization's teams and collaborate effectively"
        icon={Users}
        showTabs={false}
        searchPlaceholder="Search teams..."
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <CreateCard
                title="New Team"
                description="Create team"
                icon={CirclePlus}
              />
            </DialogTrigger>
            <CreateTeamComponent onTeamCreated={refreshTeams} />
          </Dialog>
          <StatCard
            icon={Users}
            value={teams.length}
            label="Active Teams"
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
          <StatCard
            icon={User}
            value={totalMembers}
            label="Total Members"
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={FolderKanban}
            value={totalProjects}
            label="Total Projects"
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Teams List */}
            <div className="pm-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Teams</h2>
                <span className="text-sm text-gray-500">
                  {filteredTeams.length}{" "}
                  {filteredTeams.length === 1 ? "team" : "teams"}
                </span>
              </div>
              <Separator className="mb-6" />
              {filteredTeams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTeams.map((team) => (
                    <Link key={team.id} href={`/teams/${team.id}`} className="block group">
                      <div className="pm-card p-4 hover:shadow-lg transition-all flex flex-col min-h-[180px]">
                        {/* Header with Icon */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-all flex-shrink-0">
                            <Users className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
                              {team.name}
                            </h3>
                            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                              Active
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {team.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                            {team.description}
                          </p>
                        )}

                        {/* Stats Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                            <span className="flex items-center gap-1">
                              <FolderKanban className="h-3 w-3" />
                              Projects
                            </span>
                            <span className="font-semibold text-gray-900">
                              {projectCounts[team.id] || 0}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-600 rounded-full transition-all"
                              style={{ 
                                width: `${Math.min(((projectCounts[team.id] || 0) / Math.max(...Object.values(projectCounts), 1)) * 100, 100)}%` 
                              }}
                            />
                          </div>
                        </div>

                        {/* Footer Section */}
                        <div className="space-y-3 mt-auto">
                          {/* Stats Count */}
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                            </span>
                            <span className="flex items-center gap-1">
                              <FolderKanban className="h-3.5 w-3.5" />
                              {projectCounts[team.id] || 0} project{projectCounts[team.id] !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* Team Members Avatars */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100/50">
                            {team.members.length > 0 ? (
                              <div className="flex -space-x-2">
                                {team.members.slice(0, 3).map((member, index) => {
                                  const email = member.user?.email || "";
                                  const firstName = member.user?.first_name || "";
                                  const lastName = member.user?.last_name || "";
                                  const fullName = `${firstName} ${lastName}`.trim();
                                  const initials = fullName
                                    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
                                    : email.charAt(0).toUpperCase() || "U";

                                  return (
                                    <div
                                      key={member.id || index}
                                      className="h-6 w-6 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-orange-400 to-orange-600 text-white text-[10px] font-semibold flex items-center justify-center hover:scale-110 transition-transform"
                                      title={fullName || email}
                                    >
                                      {initials}
                                    </div>
                                  );
                                })}
                                {team.members.length > 3 && (
                                  <div
                                    className="h-6 w-6 rounded-full border-2 border-white shadow-sm bg-gray-100 text-gray-700 text-[10px] font-semibold flex items-center justify-center hover:scale-110 transition-transform"
                                    title={`${team.members.length - 3} more member${team.members.length - 3 > 1 ? 's' : ''}`}
                                  >
                                    +{team.members.length - 3}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-gray-400">
                                <Users className="h-3.5 w-3.5" />
                                <span className="text-xs">No members</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mx-auto mb-6">
                    <Users className="h-10 w-10 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery
                      ? "No teams found"
                      : teams.length === 0
                      ? "No teams yet"
                      : "No teams match your filter"}
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    {searchQuery
                      ? "Try adjusting your search query to find teams"
                      : teams.length === 0
                      ? "Create your first team to start collaborating and managing projects together"
                      : "Try changing your search or filters"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Teams Details */}
            <div className="pm-card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Overview</h3>
              <Separator className="mb-4" />
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Users className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Teams</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {teams.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Members</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {totalMembers}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <FolderKanban className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Projects</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {totalProjects}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <ActivityFeed limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;
