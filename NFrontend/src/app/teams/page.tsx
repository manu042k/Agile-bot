"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CirclePlus, Users, Search, Loader2 } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import CreateTeamComponent from "@/components/team/CreateTeamComponent";
import PageHeader from "@/components/common/PageHeader";
import teamService from "@/services/teamService";
import projectService from "@/services/projectService";
import { Team } from "@/types/project";
import { useUser } from "@/hooks/useUser";
import toast from "react-hot-toast";
import { Separator } from "@/components/ui/separator";

const TeamsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectCounts, setProjectCounts] = useState<Record<number, number>>({});
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
        teamsData.forEach(team => {
          counts[team.id] = projects.filter(p => p.team?.id === team.id).length;
        });
        setProjectCounts(counts);
      } catch (err) {
        console.error("Failed to fetch projects for counts:", err);
        // Set all counts to 0 if projects fetch fails
        const counts: Record<number, number> = {};
        teamsData.forEach(team => {
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
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (team.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    return matchesSearch;
  });

  // Calculate stats
  // Note: Backend already filters teams to only return teams where user is a member
  // Count unique members across all teams
  const uniqueMemberIds = new Set<number>();
  teams.forEach(team => {
    team.members.forEach(member => {
      if (member.user?.id) {
        uniqueMemberIds.add(member.user.id);
      }
    });
  });
  const totalMembers = uniqueMemberIds.size;
  const totalProjects = Object.values(projectCounts).reduce((sum, count) => sum + count, 0);

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
      />

      <div className="px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pm-input !pl-10 pr-3 w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* New Team Button and Teams Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* New Team Button */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <button className="bg-white border border-orange-200 rounded-lg p-5 shadow-sm hover:shadow-orange-500/20 hover:border-orange-300 transition-all text-left w-full group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                        <CirclePlus className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-0.5">New Team</h3>
                        <p className="text-xs text-gray-500">Create team</p>
                      </div>
                    </div>
                  </button>
                </DialogTrigger>
                <CreateTeamComponent onTeamCreated={refreshTeams} />
              </Dialog>

              {/* Teams Overview */}
              <div className="pm-card p-6">
                <h2 className="text-lg font-semibold text-gray-900">Teams Overview</h2>
                <Separator className="my-4" />
                <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-2xl font-semibold text-gray-900">{totalMembers}</p>
                      <p className="text-xs text-gray-500 mt-1">Total Members</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-gray-900">{totalProjects}</p>
                      <p className="text-xs text-gray-500 mt-1">Total Projects</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-gray-900">{teams.length}</p>
                      <p className="text-xs text-gray-500 mt-1">Active Teams</p>
                    </div>
                  </div>
              </div>
            </div>

            {/* Teams List */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">Teams</h2>
              <Separator className="my-4" />
              {filteredTeams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTeams.map((team) => (
                    <Link key={team.id} href={`/teams/${team.id}`}>
                      <div className="pm-card pm-card-hover p-5 cursor-pointer">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                              {getTeamAvatar(team.name)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1">{team.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">{team.description || "No description"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{projectCounts[team.id] || 0} project{(projectCounts[team.id] || 0) !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchQuery ? "No teams found" : teams.length === 0 ? "No teams yet" : "No teams match your filter"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {searchQuery 
                      ? "Try adjusting your search query" 
                      : teams.length === 0 
                      ? "Create your first team to get started"
                      : "Try changing the tab filter"}
                  </p>
                  {teams.length === 0 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="pm-button-primary inline-flex items-center gap-2">
                          <CirclePlus className="h-4 w-4" />
                          Create Team
                        </button>
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
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900">Teams Details</h3>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Total Teams</p>
                  <p className="text-sm font-medium text-gray-900">{teams.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Total Members</p>
                  <p className="text-sm font-medium text-gray-900">{totalMembers}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Total Projects</p>
                  <p className="text-sm font-medium text-gray-900">{totalProjects}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              <Separator className="my-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Users className="h-3 w-3 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900">
                        Team updated
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{i} hour{i > 1 ? 's' : ''} ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeamsPage;
