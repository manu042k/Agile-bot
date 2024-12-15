import React from "react";
import NavBarComponent from "@/components/common/NavBarComponent";
import { Activity, LayoutDashboard, File, ClipboardCheck } from "lucide-react";
import { Outlet, Link, useLocation } from "react-router-dom";
import clsx from "clsx"; // Optional utility for class management

const MainLayout: React.FC = () => {
  const location = useLocation();
  const projectId = location.pathname.split("/")[2];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen">
      {/* Fixed Navbar */}
      <NavBarComponent />

      {/* Sidebar */}
      <aside className="fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-slate-50 p-4">
        <nav className="space-y-2">
          <Link
            to={`/projects/${projectId}/overview`}
            className={clsx(
              "flex items-center gap-2 p-2 rounded-md hover:bg-gray-200",
              isActive(`/projects/${projectId}/overview`) &&
                "bg-gray-300 font-semibold"
            )}
          >
            <Activity className="w-5 h-5" />
            <span>Overview</span>
          </Link>
          <Link
            to={`/projects/${projectId}/board`}
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
            to={`/projects/${projectId}/tasks`}
            className={clsx(
              "flex items-center gap-2 p-2 rounded-md hover:bg-gray-200",
              isActive(`/projects/${projectId}/tasks`) &&
                "bg-gray-300 font-semibold"
            )}
          >
            <ClipboardCheck className="w-5 h-5" />
            <span>Task List</span>
          </Link>
          <Link
            to="/projects"
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

      {/* Main Content */}
      <main className="ml-64 mt-16 flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
