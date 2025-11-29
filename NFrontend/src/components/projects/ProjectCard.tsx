"use client";
import { FolderKanban, Users, CheckSquare, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Project } from "@/types/project";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectCardProps {
  project: Project & {
    progress?: number;
    tasks?: number;
    completedTasks?: number;
  };
  compact?: boolean;
}

export default function ProjectCard({ project, compact = false }: ProjectCardProps) {
  const progress = project.progress || 0;
  const totalTasks = project.tasks || 0;
  const completedTasks = project.completedTasks || 0;
  const teamMembers = project.team?.members || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = () => {
    if (progress === 100) {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800 text-white border border-gray-800">
          Completed
        </span>
      );
    } else if (progress > 0) {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300">
          Active
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
          Planning
        </span>
      );
    }
  };

  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <div className="pm-card p-4 hover:shadow-lg transition-all flex flex-col min-h-[180px]">
        {/* Header with Icon */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-all flex-shrink-0">
            <FolderKanban className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
              {project.name}
            </h3>
            {getStatusBadge()}
          </div>
        </div>

        {/* Description */}
        {!compact && project.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {project.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Progress
            </span>
            <span className="font-semibold text-gray-900">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer Section */}
        <div className="space-y-3 mt-auto">
          {/* Tasks Count */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3.5 w-3.5" />
              {completedTasks}/{totalTasks} tasks
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(project.updated_at || project.created_at)}
            </span>
          </div>

          {/* Team Members */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100/50">
            {teamMembers.length > 0 ? (
              <TooltipProvider>
                <div className="flex -space-x-2">
                  {teamMembers.slice(0, 3).map((member, index) => {
                    const email = member.user?.email || "";
                    const firstName = member.user?.first_name || "";
                    const lastName = member.user?.last_name || "";
                    const fullName = `${firstName} ${lastName}`.trim();
                    const displayName = fullName || email.split("@")[0] || "User";
                    const initials = fullName
                      ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
                      : email.charAt(0).toUpperCase() || "U";

                    return (
                      <Tooltip key={member.id || index}>
                        <TooltipTrigger asChild>
                          <Avatar className="h-6 w-6 border-2 border-white shadow-sm hover:scale-110 transition-transform">
                            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-[10px] font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          <p className="font-medium">{displayName}</p>
                          {email && <p className="text-[10px] text-gray-400">{email}</p>}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  {teamMembers.length > 3 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="h-6 w-6 border-2 border-white shadow-sm hover:scale-110 transition-transform">
                          <AvatarFallback className="bg-gray-100 text-gray-700 text-[10px] font-semibold">
                            +{teamMembers.length - 3}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>
                          {teamMembers.length - 3} more member
                          {teamMembers.length - 3 > 1 ? "s" : ""}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TooltipProvider>
            ) : (
              <div className="flex items-center gap-1.5 text-gray-400">
                <Users className="h-3.5 w-3.5" />
                <span className="text-xs">No members</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
