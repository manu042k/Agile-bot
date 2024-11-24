"use client";

import React from "react";
import { Activity, LayoutDashboard, File, ClipboardCheck, SquarePen } from "lucide-react";
import NavBar from "./NavBar";
import { Separator } from "./ui/separator";


import { useForm } from "react-hook-form";
import Overview from "./overview";
import TaskList from "./TaskList";

const MainPage = () => {
 
  return (
    <div className="flex h-screen">
      {/* Fixed Navbar */}
      <NavBar></NavBar>

      {/* Sidebar */}
      <aside className="fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-slate-50 p-4">
        <nav className="space-y-2">
          <a
            href="#"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200"
          >
            <File className="w-5 h-5" />
            <span>Project List</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200"
          >
            <Activity className="w-5 h-5" />
            <span>Overview</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Board</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200"
          >
            <ClipboardCheck className="w-5 h-5" />
            <span>Task List</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 mt-16 flex-1 p-6">
        
<TaskList></TaskList>        
      </main>
    </div>
  );
};

export default MainPage;
