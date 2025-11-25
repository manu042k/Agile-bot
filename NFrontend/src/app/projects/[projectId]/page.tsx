"use client";
import React from "react";
import { useParams } from "next/navigation";
import { 
  FileText, 
  Users, 
  Sparkles,
  Upload
} from "lucide-react";
import ProjectHeader from "@/components/projects/ProjectHeader";
import { Separator } from "@/components/ui/separator";
import ActivityFeed from "@/components/common/ActivityFeed";

// Mock project data
const getMockProject = (id: string) => ({
  id: parseInt(id),
  name: "E-Commerce Platform",
  description: "Build a modern e-commerce platform with React and Node.js. Includes user authentication, product catalog, shopping cart, and payment integration.",
  status: "active",
  progress: 65,
  tasks: 24,
  completedTasks: 16,
  team: 5,
  color: "blue",
  created: "2024-01-15",
  deadline: "2024-06-30"
});

const ProjectDetailPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const project = getMockProject(projectId);

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader />

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-white border border-orange-200 rounded-lg p-5 shadow-sm hover:shadow-orange-500/20 hover:border-orange-300 transition-all text-left w-full group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                    <Upload className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Upload Document</h3>
                    <p className="text-xs text-gray-500">Requirements & specs</p>
                  </div>
                </div>
              </button>

              <button className="bg-white border border-orange-200 rounded-lg p-5 shadow-sm hover:shadow-orange-500/20 hover:border-orange-300 transition-all text-left w-full group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                    <Sparkles className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Generate Tasks</h3>
                    <p className="text-xs text-gray-500">AI-powered</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Project Overview */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">Project Overview</h2>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium text-gray-900">{project.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{project.tasks}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{project.completedTasks}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{project.team}</p>
                    <p className="text-xs text-gray-500 mt-1">Team Members</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <ActivityFeed projectId={parseInt(projectId)} limit={5} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Details */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900">Project Details</h3>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Status</p>
                  <span className={`pm-badge ${
                    project.status === "active" ? "bg-gray-200" :
                    project.status === "completed" ? "bg-gray-800 text-white" :
                    "bg-gray-100"
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Created</p>
                  <p className="text-sm font-medium text-gray-900">{project.created}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Deadline</p>
                  <p className="text-sm font-medium text-gray-900">{project.deadline}</p>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900">Team Members</h3>
              <Separator className="my-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                      {String.fromCharCode(64 + i)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Team Member {i}</p>
                      <p className="text-xs text-gray-500">Developer</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
