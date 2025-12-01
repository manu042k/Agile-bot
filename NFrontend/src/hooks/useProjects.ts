import { useState, useEffect, useCallback, useMemo } from "react";
import projectService from "@/services/projectService";
import taskService from "@/services/taskService";
import { Project, Task, TaskStatus } from "@/types/project";

export interface EnrichedProject extends Project {
  status: "active" | "planning" | "completed";
  progress: number;
  tasks: number;
  completedTasks: number;
  teamMemberCount: number;
  color: string;
}

const projectColors = ["blue", "green", "purple", "orange", "pink", "indigo", "cyan", "rose"];

const calculateProjectStatus = (tasks: Task[]): "active" | "planning" | "completed" => {
  if (tasks.length === 0) return "planning";
  
  const completedTasks = tasks.filter(t => t.status === TaskStatus.Completed).length;
  const activeTasks = tasks.filter(t => t.status === TaskStatus.Active).length;
  
  if (completedTasks === tasks.length && tasks.length > 0) return "completed";
  if (activeTasks > 0) return "active";
  return "planning";
};

const calculateProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.Completed).length;
  return Math.round((completedTasks / tasks.length) * 100);
};

export const useProjects = () => {
  const [projects, setProjects] = useState<EnrichedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedProjects = await projectService.getProjects();
      
      // Enrich each project with task statistics
      const enrichedProjects = await Promise.all(
        fetchedProjects.map(async (project, index) => {
          try {
            const tasks = await taskService.getTasks(project.uuid);
            const completedTasks = tasks.filter(t => t.status === TaskStatus.Completed).length;
            
            return {
              ...project,
              status: calculateProjectStatus(tasks),
              progress: calculateProgress(tasks),
              tasks: tasks.length,
              completedTasks,
              teamMemberCount: project.team?.members?.length || 0,
              color: projectColors[index % projectColors.length],
            } as EnrichedProject;
          } catch (error) {
            console.error(`Error fetching tasks for project ${project.id}:`, error);
            return {
              ...project,
              status: "planning" as const,
              progress: 0,
              tasks: 0,
              completedTasks: 0,
              teamMemberCount: project.team?.members?.length || 0,
              color: projectColors[index % projectColors.length],
            } as EnrichedProject;
          }
        })
      );

      setProjects(enrichedProjects);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      setError(err.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      await projectService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== parseInt(projectId)));
      return true;
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: projects.length,
      active: projects.filter(p => p.status === "active").length,
      completed: projects.filter(p => p.status === "completed").length,
      planning: projects.filter(p => p.status === "planning").length,
    };
  }, [projects]);

  const totalTasks = useMemo(() => {
    return projects.reduce((sum, p) => sum + p.tasks, 0);
  }, [projects]);

  const completedTasks = useMemo(() => {
    return projects.reduce((sum, p) => sum + p.completedTasks, 0);
  }, [projects]);

  const overallProgress = useMemo(() => {
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  }, [totalTasks, completedTasks]);

  return {
    projects,
    loading,
    error,
    refresh: fetchProjects,
    deleteProject,
    stats,
    overallProgress,
    totalTasks,
    completedTasks,
  };
};

export const useProject = (projectId: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedProject = await projectService.getProject(projectId);
      setProject(fetchedProject);
    } catch (err: any) {
      console.error("Error fetching project:", err);
      setError(err.message || "Failed to fetch project");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    loading,
    error,
    refresh: fetchProject,
    setProject,
  };
};
