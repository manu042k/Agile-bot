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
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import projectService from "@/services/projectService";
import { Project } from "@/types/project";

interface ProjectHeaderProps {
  showActions?: boolean;
}

export default function ProjectHeader({ showActions = true }: ProjectHeaderProps) {
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
    { icon: LayoutDashboard, label: "Overview", href: `/projects/${projectId}` },
    { icon: Sparkles, label: "Board", href: `/projects/${projectId}/board` },
    { icon: CheckSquare, label: "Tasks", href: `/projects/${projectId}/tasks` },
    { icon: Calendar, label: "Timeline", href: `/projects/${projectId}/timeline` },
    { icon: Users, label: "Team", href: `/projects/${projectId}/team` },
    { icon: FileText, label: "Documents", href: `/projects/${projectId}/documents` },
    { icon: BarChart3, label: "Analytics", href: `/projects/${projectId}/analytics` },
    { icon: Settings, label: "Settings", href: `/projects/${projectId}/settings` },
  ].map(item => ({
    ...item,
    active: pathname === item.href || (item.href === `/projects/${projectId}` && pathname === `/projects/${projectId}`)
  }));

  if (loading) {
    return (
      <div className="sticky top-0 z-20 glass-navbar">
        <div className="px-6 py-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="sticky top-0 z-20 glass-navbar">
        <div className="px-6 py-6">
          <p className="text-red-600">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-20 glass-navbar">
      <div className="px-6 py-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-white/60 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600 leading-relaxed">{project.description}</p>
          </div>
        </div>

        <Separator className="bg-white/30" />

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
                    ? "bg-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/50 hover:text-gray-900"
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
  );
}

