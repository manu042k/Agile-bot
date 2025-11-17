"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Activity, LayoutDashboard, File, ClipboardCheck } from "lucide-react";
import clsx from "clsx";

const ProjectsLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const projectId = pathname.split("/")[2];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex h-screen">
      <aside className="fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-slate-50 p-4">
        <nav className="space-y-2">
          <Link
            href={`/projects/${projectId}`}
            className={clsx(
              "flex items-center gap-2 p-2 rounded-md hover:bg-gray-200",
              isActive(`/projects/${projectId}`) && "bg-gray-300 font-semibold"
            )}
          >
            <Activity className="w-5 h-5" />
            <span>Overview</span>
          </Link>
          <Link
            href={`/projects/${projectId}/board`}
            className={clsx(
              "flex items-center gap-2 p-2 rounded-md hover:bg-gray-200",
              isActive(`/projects/${projectId}/board`) &&
                "bg-gray-300 font-semibold"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Board</span>
          </Link>
          <Link
            href={`/projects/${projectId}/task`}
            className={clsx(
              "flex items-center gap-2 p-2 rounded-md hover:bg-gray-200",
              isActive(`/projects/${projectId}/task`) &&
                "bg-gray-300 font-semibold"
            )}
          >
            <ClipboardCheck className="w-5 h-5" />
            <span>Task List</span>
          </Link>
          <Link
            href="/projects"
            className={clsx(
              "flex items-center gap-2 p-2 rounded-md hover:bg-gray-200",
              isActive("/projects") && "bg-gray-300 font-semibold"
            )}
          >
            <File className="w-5 h-5" />
            <span>Project List</span>
          </Link>
        </nav>
      </aside>
      <main className="ml-64 mt-16 flex-1 p-6">{children}</main>
    </div>
  );
};

export default ProjectsLayout;
