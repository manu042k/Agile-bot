"use client";
import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { Fragment, useState, useEffect } from "react";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import teamService from "@/services/teamService";
import projectService from "@/services/projectService";

// Cache for team and project names to avoid repeated API calls
const nameCache: Record<string, string> = {};

const getBreadcrumbLabel = (
  segment: string, 
  params: any, 
  index: number, 
  pathSegments: string[],
  nameCache: Record<string, string>
) => {
  // Handle special cases
  if (segment === "" || segment === "app") return null;
  
  // Map route segments to friendly names
  const routeLabels: Record<string, string> = {
    dashboard: "Dashboard",
    projects: "Projects",
    tasks: "Tasks",
    teams: "Teams",
    documents: "Documents",
    analytics: "Analytics",
    settings: "Settings",
    profile: "Profile",
    activity: "Activity",
    calendar: "Calendar",
    board: "Board",
    timeline: "Timeline",
    team: "Team",
    members: "Members",
    login: "Login",
    register: "Register",
  };

  // If it's a project ID, try to get project name from cache
  if (segment === params?.projectId && pathSegments[index - 1] === "projects") {
    const cacheKey = `project-${segment}`;
    return nameCache[cacheKey] || "Project";
  }

  // If it's a team ID, try to get team name from cache
  if (segment === params?.teamId && pathSegments[index - 1] === "teams") {
    const cacheKey = `team-${segment}`;
    return nameCache[cacheKey] || "Team";
  }

  // If it's a task ID
  if (segment === params?.taskId && pathSegments[index - 1] === "task") {
    return "Task Details";
  }

  // Return mapped label or capitalize
  return routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
};

const EnhancedBreadcrumb = () => {
  const pathname = usePathname();
  const params = useParams();
  const pathSegments = pathname.split("/").filter((segment) => segment);
  const [cache, setCache] = useState<Record<string, string>>(nameCache);

  // Fetch team name if on a team page
  useEffect(() => {
    const fetchTeamName = async () => {
      if (params?.teamId && pathSegments.includes("teams")) {
        const cacheKey = `team-${params.teamId}`;
        // Check both state cache and module-level cache
        if (!cache[cacheKey] && !nameCache[cacheKey]) {
          try {
            const team = await teamService.getTeam(params.teamId as string);
            const newCache = { ...cache, [cacheKey]: team.name };
            setCache(newCache);
            Object.assign(nameCache, newCache);
          } catch (err) {
            console.error("Failed to fetch team name for breadcrumb:", err);
          }
        } else if (nameCache[cacheKey] && !cache[cacheKey]) {
          // Sync module cache to state if needed
          setCache({ ...cache, [cacheKey]: nameCache[cacheKey] });
        }
      }
    };

    fetchTeamName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.teamId, pathname]);

  // Fetch project name if on a project page
  useEffect(() => {
    const fetchProjectName = async () => {
      if (params?.projectId && pathSegments.includes("projects")) {
        const cacheKey = `project-${params.projectId}`;
        // Check both state cache and module-level cache
        if (!cache[cacheKey] && !nameCache[cacheKey]) {
          try {
            const project = await projectService.getProject(params.projectId as string);
            const newCache = { ...cache, [cacheKey]: project.name };
            setCache(newCache);
            Object.assign(nameCache, newCache);
          } catch (err) {
            console.error("Failed to fetch project name for breadcrumb:", err);
          }
        } else if (nameCache[cacheKey] && !cache[cacheKey]) {
          // Sync module cache to state if needed
          setCache({ ...cache, [cacheKey]: nameCache[cacheKey] });
        }
      }
    };

    fetchProjectName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.projectId, pathname]);

  // Don't show breadcrumb on auth pages
  const authPages = ["/", "/login", "/register", "/forgot-password"];
  if (authPages.includes(pathname)) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home/Dashboard */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard" className="flex items-center gap-1 hover:text-gray-900">
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathSegments.length > 0 && (
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
        )}

        {/* Dynamic segments */}
        {pathSegments.map((segment, index) => {
          const path = "/" + pathSegments.slice(0, index + 1).join("/");
          const label = getBreadcrumbLabel(segment, params, index, pathSegments, cache);
          
          if (!label) return null;

          const isLast = index === pathSegments.length - 1;

          return (
            <Fragment key={path}>
              <BreadcrumbItem>
                {!isLast ? (
                  <BreadcrumbLink asChild>
                    <Link href={path} className="hover:text-gray-900">
                      {label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>

              {!isLast && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default EnhancedBreadcrumb;

