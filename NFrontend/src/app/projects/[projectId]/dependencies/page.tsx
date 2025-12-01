"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, Network, AlertCircle } from "lucide-react";
import ProjectHeader from "@/components/projects/ProjectHeader";
import DependencyGraph from "@/components/projects/DependencyGraph";
import taskService from "@/services/taskService";
import { Task } from "@/types/project";
import toast from "react-hot-toast";

const DependenciesPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const tasksData = await taskService.getTasks(projectId);
        setTasks(tasksData);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching tasks:", err);
        setError(err.message || "Failed to load tasks");
        toast.error("Failed to load dependency graph");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading dependency graph...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="px-6 py-8">
          <div className="pm-card p-8 text-center border-red-200 bg-red-50">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Failed to load dependency graph</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const tasksWithDeps = tasks.filter(
    (t) => t.related_work && t.related_work.length > 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader />
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-gray-900">
              Task Dependencies
            </h1>
          </div>
          <p className="text-gray-600">
            Visualize task relationships and dependencies
          </p>
        </div>

        {/* Graph with Stats */}
        <DependencyGraph tasks={tasks} />
      </div>
    </div>
  );
};

export default DependenciesPage;
