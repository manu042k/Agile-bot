import api from "@/interceptor/api";
import { Task, TaskStatus } from "@/types/project";
import { URLS } from "@/types/url-constants";

const taskService = {
  /**
   * Get all tasks for a project
   */
  async getTasks(projectId: string): Promise<Task[]> {
    const response = await api.get<Task[]>(
      URLS.TASKS_BY_PROJECT + projectId + "/tasks/"
    );
    return response.data;
  },

  /**
   * Get a single task by ID
   */
  async getTask(taskId: string): Promise<Task> {
    const response = await api.get<Task>(URLS.TASK + taskId + "/");
    return response.data;
  },

  /**
   * Create a new task
   */
  async createTask(task: {
    name: string;
    description: string;
    details?: string;
    priority: string;
    size: string;
    status?: string;
    created_by?: string;
    Project: string;
    assigned_to?: number[];
    sprint?: number | null;
  }): Promise<Task> {
    const response = await api.post<Task>(URLS.TASK, task);
    return response.data;
  },

  /**
   * Update a task (full update)
   */
  async updateTask(taskId: string, task: Partial<Task>): Promise<Task> {
    const response = await api.patch<Task>(URLS.TASKS_PATCH + taskId + "/", task);
    return response.data;
  },

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    const response = await api.patch<Task>(URLS.TASKS_PATCH + taskId + "/", {
      status,
    });
    return response.data;
  },

  /**
   * Assign users to a task
   */
  async assignUsers(taskId: string, userIds: number[]): Promise<Task> {
    const response = await api.patch<Task>(URLS.TASKS_PATCH + taskId + "/", {
      assigned_to: userIds,
    });
    return response.data;
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    await api.delete(URLS.TASK + taskId + "/");
  },

  /**
   * Trigger task generation (AI)
   */
  async triggerTask(data: any): Promise<any> {
    const response = await api.post<any>(URLS.TASK_TRIGGER, data);
    return response.data;
  },

  /**
   * Get project timeline
   */
  async getTimeline(projectId: string): Promise<any> {
    const response = await api.get(
      `${URLS.PROJECT_TIMELINE}${projectId}/timeline/`
    );
    return response.data;
  },

  /**
   * Get comments for a task
   */
  async getComments(taskId: string): Promise<any[]> {
    const response = await api.get(
      `${URLS.TASK}${taskId}/comments/`
    );
    return response.data;
  },

  /**
   * Create a comment on a task
   */
  async createComment(taskId: string, content: string): Promise<any> {
    const response = await api.post(
      `${URLS.TASK}${taskId}/comments/`,
      { content }
    );
    return response.data;
  },
};

export default taskService;
