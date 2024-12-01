import React from "react";
import NavBarComponent from "@/components/common/NavBarComponent";
import { Activity, LayoutDashboard, File, ClipboardCheck } from "lucide-react";
import { Outlet, Link, useLocation } from "react-router-dom";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const projectId = location.pathname.split("/")[2];

  return (
    <div className="flex h-screen">
      {/* Fixed Navbar */}
      <NavBarComponent />

      {/* Sidebar */}
      <aside className="fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-slate-50 p-4">
        <nav className="space-y-2">
          <Link
            to="/projects"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200"
          >
            <File className="w-5 h-5" />
            <span>Project List</span>
          </Link>
          <Link
            to={`/projects/${projectId}/overview`}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200"
          >
            <Activity className="w-5 h-5" />
            <span>Overview</span>
          </Link>
          <Link
            to={`/projects/${projectId}/board`}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Board</span>
          </Link>
          <Link
            to={`/projects/${projectId}/tasks`}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200"
          >
            <ClipboardCheck className="w-5 h-5" />
            <span>Task List</span>
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
