"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CirclePlus,
  FolderOpen,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Search,
  Grid3x3,
  List,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
  FolderKanban,
  CheckCircle,
  Clock3,
  LayoutGrid,
  Trash2,
  Archive,
} from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import CreateProjectComponent from "@/components/projects/CreateProjectComponent";
import Link from "next/link";
import PageHeader from "@/components/common/PageHeader";
import {
  getProjectStatusBadgeClass,
  getProjectStatusDotClass,
} from "@/lib/colorUtils";

// Mock data
const mockProjects = [
  {
    id: 1,
    name: "E-Commerce Platform",
    description:
      "Build a modern e-commerce platform with React and Node.js. Includes user authentication, product catalog, shopping cart, and payment integration.",
    status: "active",
    progress: 65,
    tasks: 24,
    completedTasks: 16,
    team: 5,
    color: "blue",
    created: "2024-01-15",
  },
  {
    id: 2,
    name: "Mobile Banking App",
    description:
      "Develop a secure mobile banking application with biometric authentication, transaction history, and bill payment features.",
    status: "active",
    progress: 42,
    tasks: 18,
    completedTasks: 8,
    team: 8,
    color: "green",
    created: "2024-01-20",
  },
  {
    id: 3,
    name: "AI Analytics Dashboard",
    description:
      "Create an analytics dashboard with AI-powered insights, real-time data visualization, and customizable reports.",
    status: "planning",
    progress: 15,
    tasks: 12,
    completedTasks: 2,
    team: 4,
    color: "purple",
    created: "2024-02-01",
  },
  {
    id: 4,
    name: "Content Management System",
    description:
      "Build a headless CMS with RESTful API, content versioning, and multi-language support.",
    status: "completed",
    progress: 100,
    tasks: 30,
    completedTasks: 30,
    team: 6,
    color: "orange",
    created: "2023-12-10",
  },
  {
    id: 5,
    name: "Social Media Platform",
    description:
      "Develop a social networking platform with real-time messaging, content sharing, and user profiles.",
    status: "active",
    progress: 78,
    tasks: 45,
    completedTasks: 35,
    team: 12,
    color: "pink",
    created: "2024-01-05",
  },
  {
    id: 6,
    name: "IoT Device Manager",
    description:
      "Create a management system for IoT devices with remote monitoring, firmware updates, and analytics.",
    status: "planning",
    progress: 8,
    tasks: 20,
    completedTasks: 2,
    team: 7,
    color: "indigo",
    created: "2024-02-05",
  },
];

const ProjectsPage = () => {
  const searchParams = useSearchParams();
  const tabStatus = searchParams.get("tab");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "board">("grid");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);

  // Use tab status if available, otherwise use filterStatus
  const effectiveStatus = tabStatus || filterStatus;

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      effectiveStatus === "all" ||
      !effectiveStatus ||
      project.status === effectiveStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: mockProjects.length,
    active: mockProjects.filter((p) => p.status === "active").length,
    completed: mockProjects.filter((p) => p.status === "completed").length,
    planning: mockProjects.filter((p) => p.status === "planning").length,
  };

  const totalTasks = mockProjects.reduce((sum, p) => sum + p.tasks, 0);
  const completedTasks = mockProjects.reduce(
    (sum, p) => sum + p.completedTasks,
    0
  );
  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getColorGradient = (color: string) => {
    // Use consistent gray gradient for all projects
    return "from-gray-600 to-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Projects"
        description="Manage and track your project portfolio"
        icon={FolderKanban}
        tabs={[
          { icon: FolderKanban, label: "Projects", href: "/projects" },
          { icon: TrendingUp, label: "Active", href: "/projects?tab=active" },
          {
            icon: CheckCircle,
            label: "Completed",
            href: "/projects?tab=completed",
          },
          { icon: Clock3, label: "Planning", href: "/projects?tab=planning" },
        ]}
      />

      <div className="px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pm-input !pl-10 pr-3 w-full"
                />
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <select
                  value={effectiveStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pm-input min-w-[140px] flex-shrink-0"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="planning">Planning</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 flex-shrink-0">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "grid"
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                    title="Grid view"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "list"
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("board")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "board"
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                    title="Board view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button className="pm-button-primary inline-flex items-center gap-2">
                  <CirclePlus className="h-4 w-4" />
                  New Project
                </button>
              </DialogTrigger>
              <CreateProjectComponent />
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
                        <h3 className="font-semibold text-gray-900 text-sm mb-0.5">
                          Create Project
                        </h3>
                        <p className="text-xs text-gray-500">New project</p>
                      </div>
                    </div>
                  </button>
                </DialogTrigger>
                <CreateProjectComponent />
              </Dialog>

              <button className="pm-card p-5 text-left group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <Sparkles className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">
                      AI Generate
                    </h3>
                    <p className="text-xs text-gray-500">AI-powered</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Projects Overview */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Projects Overview
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium text-gray-900">
                      {overallProgress}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full transition-all"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.total}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Total Projects</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.active}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Active</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.completed}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects List */}
            <div className="pm-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Projects
                </h2>
                {selectedProjects.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedProjects.length} selected
                    </span>
                    <button
                      onClick={() => {
                        // Bulk archive
                        setSelectedProjects([]);
                      }}
                      className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Archive className="h-4 w-4" />
                      Archive
                    </button>
                    <button
                      onClick={() => {
                        // Bulk delete
                        setSelectedProjects([]);
                      }}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedProjects([])}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              {filteredProjects.length > 0 ? (
                viewMode === "board" ? (
                  <div className="grid grid-cols-4 gap-4">
                    {["planning", "active", "completed"].map((status) => {
                      const statusProjects = filteredProjects.filter(
                        (p) => p.status === status
                      );
                      return (
                        <div key={status} className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 capitalize">
                              {status}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {statusProjects.length}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {statusProjects.map((project) => (
                              <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                              >
                                <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    {project.name}
                                  </h4>
                                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                                    <div
                                      className="h-full bg-orange-600 rounded-full"
                                      style={{ width: `${project.progress}%` }}
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>
                                      {project.completedTasks}/{project.tasks}{" "}
                                      tasks
                                    </span>
                                    <span>•</span>
                                    <span>{project.team} members</span>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProjects.map((project) => {
                      const isSelected = selectedProjects.includes(project.id);
                      return (
                        <div
                          key={project.id}
                          className={`group relative bg-white rounded-xl p-5 h-full flex flex-col shadow-sm hover:shadow-lg transition-all duration-300 border ${
                            isSelected
                              ? "border-gray-900 ring-2 ring-gray-900"
                              : "border-gray-100 hover:border-gray-200"
                          } overflow-hidden`}
                        >
                          {selectedProjects.length > 0 && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (e.target.checked) {
                                  setSelectedProjects([
                                    ...selectedProjects,
                                    project.id,
                                  ]);
                                } else {
                                  setSelectedProjects(
                                    selectedProjects.filter(
                                      (id) => id !== project.id
                                    )
                                  );
                                }
                              }}
                              className="absolute top-4 left-4 w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 z-10"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          <Link
                            href={`/projects/${project.id}`}
                            className="flex-1 flex flex-col"
                          >
                            {/* Accent Bar */}
                            <div
                              className={`absolute top-0 left-0 right-0 h-1.5 ${getProjectStatusDotClass(
                                project.status
                              )}`}
                            />

                            {/* Header */}
                            <div className="mb-4">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="p-2.5 rounded-xl bg-gray-900 shadow-md">
                                  <FolderOpen className="h-5 w-5 text-white" />
                                </div>
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getProjectStatusBadgeClass(
                                    project.status
                                  )} flex items-center gap-1.5`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${getProjectStatusDotClass(
                                      project.status
                                    )}`}
                                  />
                                  {project.status}
                                </span>
                              </div>
                              <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-1 group-hover:text-gray-700 transition-colors">
                                {project.name}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                {project.description}
                              </p>
                            </div>

                            {/* Progress */}
                            <div className="mb-4 flex-1">
                              <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-2">
                                <span>Progress</span>
                                <span className="font-bold text-gray-900">
                                  {project.progress}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-orange-600 rounded-full transition-all duration-500"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span className="font-medium">
                                      {project.completedTasks}/{project.tasks}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5" />
                                    <span className="font-medium">
                                      {project.team}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 group-hover:text-gray-900 group-hover:gap-2 transition-all">
                                  <span>View</span>
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProjects.map((project) => {
                      const isSelected = selectedProjects.includes(project.id);
                      return (
                        <div
                          key={project.id}
                          className={`group bg-white rounded-xl p-4 hover:shadow-md transition-all duration-300 border ${
                            isSelected
                              ? "border-gray-900 ring-2 ring-gray-900"
                              : "border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {selectedProjects.length > 0 && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  if (e.target.checked) {
                                    setSelectedProjects([
                                      ...selectedProjects,
                                      project.id,
                                    ]);
                                  } else {
                                    setSelectedProjects(
                                      selectedProjects.filter(
                                        (id) => id !== project.id
                                      )
                                    );
                                  }
                                }}
                                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-offset-0 flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            <Link
                              href={`/projects/${project.id}`}
                              className="flex items-center gap-4 flex-1"
                            >
                              <div className="p-2.5 rounded-xl bg-gray-900 shadow-sm flex-shrink-0">
                                <FolderOpen className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-bold text-gray-900">
                                    {project.name}
                                  </h3>
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getProjectStatusBadgeClass(
                                      project.status
                                    )} flex items-center gap-1.5`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${getProjectStatusDotClass(
                                        project.status
                                      )}`}
                                    />
                                    {project.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                                  {project.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="font-medium">
                                    {project.tasks} tasks
                                  </span>
                                  <span className="font-medium">
                                    {project.team} members
                                  </span>
                                  <span>Created {project.created}</span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xl font-bold text-gray-900 mb-1">
                                  {project.progress}%
                                </p>
                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-orange-600 rounded-full transition-all"
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                  <div className="max-w-sm mx-auto">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                      <FolderOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      No projects found
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      {searchQuery
                        ? "Try adjusting your search"
                        : "Get started by creating your first project"}
                    </p>
                    {!searchQuery && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="px-5 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 inline-flex items-center gap-2">
                            <CirclePlus className="h-4 w-4" />
                            Create Project
                          </button>
                        </DialogTrigger>
                        <CreateProjectComponent />
                      </Dialog>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Projects Details */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">
                Projects Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Total Projects</p>
                  <p className="text-sm font-medium text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Active</p>
                  <p className="text-sm font-medium text-gray-900">
                    {stats.active}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Completed</p>
                  <p className="text-sm font-medium text-gray-900">
                    {stats.completed}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="h-3 w-3 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900">Project updated</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {i} hour{i > 1 ? "s" : ""} ago
                      </p>
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

export default ProjectsPage;
