"use client";
import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

// Mock data for breadcrumb labels
const getBreadcrumbLabel = (segment: string, params: any, index: number, pathSegments: string[]) => {
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

  // If it's a project ID, try to get project name
  if (segment === params?.projectId && pathSegments[index - 1] === "projects") {
    return "E-Commerce Platform"; // Mock - should come from API
  }

  // If it's a team ID, try to get team name
  if (segment === params?.teamId && pathSegments[index - 1] === "teams") {
    return "Development Team"; // Mock - should come from API
  }

  // If it's a task ID
  if (segment === params?.taskId && pathSegments[index - 1] === "task") {
    return "Task Details"; // Mock - should come from API
  }

  // Return mapped label or capitalize
  return routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
};

const EnhancedBreadcrumb = () => {
  const pathname = usePathname();
  const params = useParams();
  const pathSegments = pathname.split("/").filter((segment) => segment);

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
          const label = getBreadcrumbLabel(segment, params, index, pathSegments);
          
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

