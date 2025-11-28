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
                    <Link key={team.id} href={`/teams/${team.id}`}>
                      <div className="group relative pm-card p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-orange-200">
                        {/* Avatar and Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative flex-shrink-0">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                              <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-base">
                                {getTeamAvatar(team.name)}
                              </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1.5 group-hover:text-orange-600 transition-colors text-lg">
                              {team.name}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                              {team.description || "No description provided"}
                            </p>
                          </div>
                        </div>

                        {/* Stats Footer */}
                        <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-50">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Members</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {team.members.length}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-purple-50">
                              <FolderKanban className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Projects</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {projectCounts[team.id] || 0}
                              </p>
                            </div>
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
                  <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                    {searchQuery
                      ? "Try adjusting your search query to find teams"
                      : teams.length === 0
                      ? "Create your first team to start collaborating and managing projects together"
                      : "Try changing your search or filters"}
                  </p>
                  {teams.length === 0 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <CreateCard
                          title="Create Team"
                          description="New team"
                          icon={CirclePlus}
                        />
                      </DialogTrigger>
                      <CreateTeamComponent onTeamCreated={refreshTeams} />
                    </Dialog>
                  )}
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
