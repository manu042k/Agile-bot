"use client";
import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import {
  Users,
  FolderKanban,
  Settings,
  Search,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import teamService from "@/services/teamService";
import projectService from "@/services/projectService";
import { Team, Project } from "@/types/project";
import toast from "react-hot-toast";

const TeamProjectsPage = () => {
  const params = useParams();
  const pathname = usePathname();
  const teamId = params.teamId as string;
  const [team, setTeam] = useState<Team | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch team and projects data
  useEffect(() => {
    const fetchData = async () => {
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
      fetchData();
    }
  }, [teamId]);

  // Generate team avatar initials
  const getTeamAvatar = (name: string) => {
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading team projects...</p>
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

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Team Header with Tabs */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
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
        {/* Header */}
        <div className="mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Team Projects
            </h2>
            <p className="text-gray-600">
              Projects associated with this team
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pm-input !pl-10 pr-3 w-full"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">
              {projects.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Projects</p>
          </div>
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">
              {projects.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Active Projects</p>
          </div>
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">
              {team.members.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Team Members</p>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="group relative bg-white rounded-2xl p-6 h-full flex flex-col shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-200 overflow-hidden">
                  {/* Accent Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-900" />

                  {/* Header */}
                  <div className="mb-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-gray-900 shadow-lg">
                        <FolderKanban className="h-5 w-5 text-white" />
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-gray-200 text-gray-700 border-gray-300">
                        {project.visibility || "private"}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-gray-700 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {project.description || "No description"}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Created {project.created_at ? new Date(project.created_at).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="pm-card p-16 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No projects found
              </h3>
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search"
                  : "No projects found for this team"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamProjectsPage;
