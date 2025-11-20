import { useState, useEffect } from 'react';
import projectService from '@/services/projectService';
import { Project } from '@/types/project';
import toast from 'react-hot-toast';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getProjects();
      setProjects(response);
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
      setError(err);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { 
    projects, 
    loading, 
    error, 
    refetch: fetchProjects 
  };
};

export const useProject = (projectId: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProject = async () => {
    if (!projectId || projectId === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getProject(projectId);
      setProject(response);
    } catch (err: any) {
      console.error('Failed to fetch project:', err);
      setError(err);
      toast.error('Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  return { 
    project, 
    loading, 
    error, 
    refetch: fetchProject,
    setProject 
  };
};
