"use client";
import { useParams, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Users, 
  Settings,
  BarChart3,
  Sparkles,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

// Mock project data
const getMockProject = (id: string) => ({
  id: parseInt(id),
  name: "E-Commerce Platform",
  description: "Build a modern e-commerce platform with React and Node.js. Includes user authentication, product catalog, shopping cart, and payment integration.",
  status: "active",
});

interface ProjectHeaderProps {
  showActions?: boolean;
}

export default function ProjectHeader({ showActions = true }: ProjectHeaderProps) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.projectId as string;
  const project = getMockProject(projectId);

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

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-gray-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600 leading-relaxed">{project.description}</p>
          </div>
        </div>

        <Separator className="bg-gray-200" />

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
  );
}

