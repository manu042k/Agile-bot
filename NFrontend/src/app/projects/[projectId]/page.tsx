"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  FileText,
  Users,
  Sparkles,
  Loader2,
  Archive,
  AlertTriangle,
  ListTodo,
  CheckCircle2,
} from "lucide-react";
import ProjectHeader from "@/components/projects/ProjectHeader";
import { Separator } from "@/components/ui/separator";
import ActivityFeed from "@/components/common/ActivityFeed";
import UploadDocumentButton from "@/components/projects/UploadDocumentButton";
import GenerateTasksButton from "@/components/projects/GenerateTasksButton";
import StatCard from "@/components/common/StatCard";
import projectService from "@/services/projectService";
import taskService from "@/services/taskService";
import { Project, TaskStatus } from "@/types/project";

const ProjectDetailPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    progress: 0,
  });

  const fetchTaskStats = async () => {
    try {
      const tasks = await taskService.getTasks(projectId);
      const completedTasks = tasks.filter(
        (t) => t.status === TaskStatus.Completed
      ).length;
      const progress =
        tasks.length > 0
          ? Math.round((completedTasks / tasks.length) * 100)
          : 0;
      setTaskStats({
        total: tasks.length,
        completed: completedTasks,
        progress,
      });
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const projectData = await projectService.getProject(projectId);
        setProject(projectData);

        // Fetch tasks for progress calculation
        await fetchTaskStats();
      } catch (err: any) {
        setError(err.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="pm-card p-8 text-center border-red-200 bg-red-50">
          <p className="text-red-600 font-medium mb-2">
            Failed to load project
          </p>
          <p className="text-sm text-red-500">{error || "Project not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader />

      {/* Main Content */}
      <div className="px-6 py-8">
        {/* Archived Team Warning */}
        {project.team?.is_archived && (
          <div className="mb-6 pm-card p-4 border-orange-200 bg-orange-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-orange-900 mb-1">
                  Team Archived
                </p>
                <p className="text-sm text-orange-700">
                  This project is associated with an archived team. The team
                  &quot;{project.team.name}&quot; has been archived. You can
                  still access this project, but team management features are
                  disabled.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <UploadDocumentButton
                projectId={projectId}
                description="Requirements & specs"
              />

              <GenerateTasksButton
                projectId={projectId}
                onTasksGenerated={fetchTaskStats}
              />
            </div>

            {/* Project Overview */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Project Overview
              </h2>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium text-gray-900">
                      {taskStats.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full transition-all"
                      style={{ width: `${taskStats.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <StatCard
                    icon={ListTodo}
                    value={taskStats.total}
                    label="Total Tasks"
                    className="p-0 border-0 shadow-none bg-transparent"
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                  />
                  <StatCard
                    icon={CheckCircle2}
                    value={taskStats.completed}
                    label="Completed"
                    className="p-0 border-0 shadow-none bg-transparent"
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                  />
                  <StatCard
                    icon={Users}
                    value={project.team?.members?.length || 0}
                    label="Team Members"
                    className="p-0 border-0 shadow-none bg-transparent"
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                  />
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
                  <p className="text-xs text-gray-500 mb-1.5">Visibility</p>
                  <span className="pm-badge bg-gray-200">
                    {project.visibility}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Team</p>
                  <p className="text-sm font-medium text-gray-900">
                    {project.team?.name || "No team"}
                  </p>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900">Team Members</h3>
              <Separator className="my-4" />
              {project.team?.members && project.team.members.length > 0 ? (
                <div className="space-y-3">
                  {project.team.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {member.user?.email?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.user?.email || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No team members</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
