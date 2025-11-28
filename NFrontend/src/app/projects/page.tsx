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
  Loader2,
} from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import CreateProjectComponent from "@/components/projects/CreateProjectComponent";
import Link from "next/link";
import PageHeader from "@/components/common/PageHeader";
import {
  getProjectStatusBadgeClass,
  getProjectStatusDotClass,
} from "@/lib/colorUtils";
import { Separator } from "@/components/ui/separator";
import ActivityFeed from "@/components/common/ActivityFeed";
import { useProjects } from "@/hooks/useProjects";
import toast from "react-hot-toast";
import CreateCard from "@/components/common/CreateCard";
import StatCard from "@/components/common/StatCard";

const ProjectsPage = () => {
  const searchParams = useSearchParams();
  const tabStatus = searchParams.get("tab");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "board">("grid");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch projects using the custom hook
  const { projects, loading, error, refresh, deleteProject } = useProjects();

  // Use tab status if available, otherwise use filterStatus
  const effectiveStatus = tabStatus || filterStatus;

  const filteredProjects = projects.filter((project) => {
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
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    planning: projects.filter((p) => p.status === "planning").length,
  };

  const totalTasks = projects.reduce((sum, p) => sum + p.tasks, 0);
  const completedTasks = projects.reduce((sum, p) => sum + p.completedTasks, 0);
  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleDeleteProject = async (projectId: number) => {
    try {
      await deleteProject(projectId.toString());
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const handleProjectCreated = () => {
    setDialogOpen(false);
    refresh();
    toast.success("Project created successfully");
  };

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
        searchPlaceholder="Search projects..."
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        viewModeButtons={
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-gray-900 shadow-sm"
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
                  ? "bg-white text-gray-900 shadow-sm"
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
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Board view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="px-6 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading projects...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="pm-card p-8 text-center border-red-200 bg-red-50 mt-6">
            <p className="text-red-600 font-medium mb-2">
              Failed to load projects
            </p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <CreateCard
                      title="Create Project"
                      description="New project"
                      icon={CirclePlus}
                    />
                  </DialogTrigger>
                  <CreateProjectComponent onSuccess={handleProjectCreated} />
                </Dialog>

                <CreateCard
                  title="AI Generate"
                  description="AI-powered"
                  icon={Sparkles}
                  iconBgColor="bg-gray-100 group-hover:bg-gray-200"
                  iconColor="text-gray-700"
                />
              </div>

              {/* Projects Overview */}
              <div className="pm-card p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Projects Overview
                </h2>
                <Separator className="my-4" />
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
                    <StatCard
                      icon={FolderKanban}
                      value={stats.total}
                      label="Total Projects"
                      className="p-0 border-0 shadow-none bg-transparent"
                      iconBgColor="bg-blue-100"
                      iconColor="text-blue-600"
                    />
                    <StatCard
                      icon={TrendingUp}
                      value={stats.active}
                      label="Active"
                      className="p-0 border-0 shadow-none bg-transparent"
                      iconBgColor="bg-orange-100"
                      iconColor="text-orange-600"
                    />
                    <StatCard
                      icon={CheckCircle2}
                      value={stats.completed}
                      label="Completed"
                      className="p-0 border-0 shadow-none bg-transparent"
                      iconBgColor="bg-green-100"
                      iconColor="text-green-600"
                    />
                  </div>
                </div>
              </div>

              {/* Projects List */}
              <div className="pm-card p-6">
                <div className="flex items-center justify-between">
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
                <Separator className="my-4" />
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
                                        style={{
                                          width: `${project.progress}%`,
                                        }}
                                      />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <span>
                                        {project.completedTasks}/{project.tasks}{" "}
                                        tasks
                                      </span>
                                      <span>•</span>
                                      <span>
                                        {project.teamMemberCount} members
                                      </span>
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
                        const isSelected = selectedProjects.includes(
                          project.id
                        );
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
                                        {project.teamMemberCount}
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
                        const isSelected = selectedProjects.includes(
                          project.id
                        );
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
                                      {project.teamMemberCount} members
                                    </span>
                                    <span>
                                      Created{" "}
                                      {new Date(
                                        project.created_at
                                      ).toLocaleDateString()}
                                    </span>
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
                            <CreateCard
                              title="Create Project"
                              description="New project"
                              icon={CirclePlus}
                            />
                          </DialogTrigger>
                          <CreateProjectComponent
                            onSuccess={handleProjectCreated}
                          />
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
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">
                      Total Projects
                    </p>
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
              <ActivityFeed limit={5} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
