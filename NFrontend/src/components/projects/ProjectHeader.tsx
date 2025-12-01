"use client";
import { useParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Users,
  Settings,
  BarChart3,
  Sparkles,
  Calendar,
  Loader2,
  Network,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import projectService from "@/services/projectService";
import { Project } from "@/types/project";

interface ProjectHeaderProps {
  showActions?: boolean;
}

export default function ProjectHeader({
  showActions = true,
}: ProjectHeaderProps) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const projectData = await projectService.getProject(projectId);
        setProject(projectData);
      } catch (err) {
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Overview",
      href: `/projects/${projectId}`,
    },
    {
      icon: Calendar,
      label: "Timeline",
      href: `/projects/${projectId}/timeline`,
    },
    { icon: Sparkles, label: "Board", href: `/projects/${projectId}/board` },
    { icon: CheckSquare, label: "Tasks", href: `/projects/${projectId}/tasks` },
    { icon: Network, label: "Dependencies", href: `/projects/${projectId}/dependencies` },
    { icon: Users, label: "Team", href: `/projects/${projectId}/team` },
    {
      icon: FileText,
      label: "Documents",
      href: `/projects/${projectId}/documents`,
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: `/projects/${projectId}/analytics`,
    },
    {
      icon: Settings,
      label: "Settings",
      href: `/projects/${projectId}/settings`,
    },
  ].map((item) => ({
    ...item,
    active:
      pathname === item.href ||
      (item.href === `/projects/${projectId}` &&
        pathname === `/projects/${projectId}`),
  }));

  if (loading) {
    return (
      <div className="sticky top-0 z-50 glass-navbar">
        <div className="px-6 py-4 flex items-center justify-center h-24">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="sticky top-0 z-50 glass-navbar">
        <div className="px-6 py-4 h-24 flex items-center">
          <p className="text-red-600">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 glass-navbar w-full max-w-full overflow-hidden box-border">
      <div className="w-full max-w-full px-4 sm:px-6 py-4 box-border">
        {/* Project Info - Compact */}
        <div className="flex items-center gap-3 mb-4 w-full max-w-full overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-white/60 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {project.name}
            </h1>
            <p className="hidden sm:block text-sm text-gray-600 truncate max-w-md">
              {project.description}
            </p>
          </div>
        </div>

        {/* Navigation Tabs - Scrollable */}
        <div className="w-full max-w-full overflow-x-auto overflow-y-hidden scrollbar-hide -mx-1 px-1 box-border">
          <div className="flex items-center gap-1 w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    item.active
                      ? "bg-orange-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-white/50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
