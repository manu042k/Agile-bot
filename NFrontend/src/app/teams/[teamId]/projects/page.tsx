"use client";
import { useState } from "react";
import { useParams, usePathname } from "next/navigation";
import {
  Users,
  FolderKanban,
  Settings,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";

// Mock team data
const getMockTeam = (teamId: string) => ({
  id: teamId,
  name: "Development Team",
  projects: [
    {
      id: 1,
      name: "E-Commerce Platform",
      description: "Build a modern e-commerce platform",
      progress: 65,
      tasks: 24,
      completed: 16,
      status: "active",
      created: "2024-01-15",
    },
    {
      id: 2,
      name: "Mobile Banking App",
      description: "Develop a secure mobile banking application",
      progress: 42,
      tasks: 18,
      completed: 8,
      status: "active",
      created: "2024-01-20",
    },
    {
      id: 3,
      name: "AI Analytics Dashboard",
      description: "Create an analytics dashboard with AI-powered insights",
      progress: 78,
      tasks: 45,
      completed: 35,
      status: "active",
      created: "2024-02-01",
    },
  ],
});

const TeamProjectsPage = () => {
  const params = useParams();
  const pathname = usePathname();
  const teamId = params.teamId as string;
  const team = getMockTeam(teamId);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredProjects = team.projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {team.name}
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Responsible for developing and maintaining the application
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
        {/* Header with Actions */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Team Projects
              </h2>
              <p className="text-gray-600">
                Projects associated with this team
              </p>
            </div>
            <button className="pm-button-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Project
            </button>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">
              {team.projects.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Projects</p>
          </div>
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">
              {team.projects.filter((p) => p.status === "active").length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Active</p>
          </div>
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">
              {team.projects.reduce((sum, p) => sum + p.tasks, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
          </div>
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">
              {Math.round(
                team.projects.reduce((sum, p) => sum + p.progress, 0) /
                  team.projects.length
              )}
              %
            </p>
            <p className="text-xs text-gray-500 mt-1">Avg Progress</p>
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
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          project.status === "active"
                            ? "bg-gray-200 text-gray-700 border-gray-300"
                            : project.status === "completed"
                            ? "bg-gray-800 text-white border-gray-900"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-gray-700 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="mb-5 flex-1">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-2">
                      <span>Progress</span>
                      <span className="font-bold text-gray-900">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-900 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {project.completed}/{project.tasks} tasks completed
                      </span>
                      <span>Created {project.created}</span>
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
              <p className="text-sm text-gray-500 mb-6">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Create a project for this team"}
              </p>
              {!searchQuery && (
                <button className="pm-button-primary inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Project
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamProjectsPage;
