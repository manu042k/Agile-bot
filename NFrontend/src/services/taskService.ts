import api from "@/interceptor/api";
import { Task } from "@/types/project";
import { URLS } from "@/types/url-constants";

const taskService = {
  async getTasks(id: string): Promise<Task[]> {
    const response = await api.get<Task[]>(
      URLS.TASKS_BY_PROJECT + id + "/tasks/"
    );
    return response.data;
  },
  async createTask(task: any): Promise<any> {
    const response = await api.post<any>(URLS.TASK, task);
    return response.data;
  },
  async updateTask(id: string, task: any): Promise<any> {
    const response = await api.patch<any>(URLS.TASKS_PATCH + id + "/", task);
    return response.data;
  }, 

  async triggerTask(data:any): Promise<any> {
    const response = await api.post<any>(URLS.TASK_TRIGGER , data);
    return response.data;
  }
};

export default taskService;
