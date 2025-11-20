import { useState, useEffect } from 'react';
import taskService from '@/services/taskService';
import { Task } from '@/types/project';
import toast from 'react-hot-toast';

export const useTasks = (projectId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = async () => {
    if (!projectId || projectId === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getTasks(projectId);
      setTasks(response);
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
      setError(err);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const updateTask = (updatedTask: Task) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.taskid === updatedTask.taskid ? updatedTask : task
      )
    );
  };

  const addTask = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const removeTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.taskid !== taskId));
  };

  return { 
    tasks, 
    loading, 
    error, 
    refetch: fetchTasks,
    updateTask,
    addTask,
    removeTask
  };
};
