"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CirclePlus, Users, Search, UserCheck, UsersRound } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import CreateTeamComponent from "@/components/team/CreateTeamComponent";
import PageHeader from "@/components/common/PageHeader";

// Mock teams data
const mockTeams = [
  {
    id: 1,
    name: "Frontend Team",
    description: "Responsible for user interface and user experience",
    members: 8,
    projects: 5,
    avatar: "FT"
  },
  {
    id: 2,
    name: "Backend Team",
    description: "Handles server-side logic and database management",
    members: 6,
    projects: 4,
    avatar: "BT"
  },
  {
    id: 3,
    name: "DevOps Team",
    description: "Manages infrastructure, CI/CD, and deployment",
    members: 4,
    projects: 8,
    avatar: "DT"
  },
  {
    id: 4,
    name: "Design Team",
    description: "Creates visual designs and user experience flows",
    members: 5,
    projects: 6,
    avatar: "DS"
  },
  {
    id: 5,
    name: "QA Team",
    description: "Ensures quality through testing and validation",
    members: 7,
    projects: 10,
    avatar: "QA"
  }
];

const TeamsPage = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "all";
  const [searchQuery, setSearchQuery] = useState("");

  // Mock current user for filtering
  const currentUser = "John Doe";

  const filteredTeams = mockTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply tab filters
    let matchesTab = true;
    if (tab === "my-teams") {
      // Mock: filter teams where user is a member
      matchesTab = team.id <= 3; // Mock filter
    } else if (tab === "members") {
      // Show all teams for members tab
      matchesTab = true;
    }
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Teams"
        description="Manage your organization's teams and collaborate effectively"
        icon={Users}
        tabs={[
          { icon: Users, label: "Teams", href: "/teams" },
          { icon: UserCheck, label: "My Teams", href: "/teams?tab=my-teams" },
          { icon: UsersRound, label: "Members", href: "/teams?tab=members" },
        ]}
      />

      <div className="px-6 py-8">
        {/* Search and Actions */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
            <Dialog>
              <DialogTrigger asChild>
                <button className="pm-button-primary inline-flex items-center gap-2">
                  <CirclePlus className="h-4 w-4" />
                  New Team
                </button>
              </DialogTrigger>
              <CreateTeamComponent />
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="pm-card p-5 text-left group hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                        <CirclePlus className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Create Team</h3>
                        <p className="text-xs text-gray-500">New team</p>
                      </div>
                    </div>
                  </button>
                </DialogTrigger>
                <CreateTeamComponent />
              </Dialog>

              <button className="pm-card p-5 text-left group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <Users className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Manage Members</h3>
                    <p className="text-xs text-gray-500">Team members</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Teams Overview */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Teams Overview</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Total Teams</span>
                    <span className="font-medium text-gray-900">{mockTeams.length}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full transition-all"
                      style={{ width: `${(mockTeams.length / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{mockTeams.reduce((sum, t) => sum + t.members, 0)}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Members</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{mockTeams.reduce((sum, t) => sum + t.projects, 0)}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Projects</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{mockTeams.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Active Teams</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Teams List */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Teams</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTeams.map((team) => (
                  <Link key={team.id} href={`/teams/${team.id}`}>
                    <div className="pm-card pm-card-hover p-5 cursor-pointer">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
                            {team.avatar}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">{team.name}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{team.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{team.members} members</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{team.projects} projects</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {filteredTeams.length === 0 && searchQuery && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams found</h3>
                  <p className="text-sm text-gray-500">Try adjusting your search query</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Teams Details */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Teams Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Total Teams</p>
                  <p className="text-sm font-medium text-gray-900">{mockTeams.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Total Members</p>
                  <p className="text-sm font-medium text-gray-900">{mockTeams.reduce((sum, t) => sum + t.members, 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Total Projects</p>
                  <p className="text-sm font-medium text-gray-900">{mockTeams.reduce((sum, t) => sum + t.projects, 0)}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
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
