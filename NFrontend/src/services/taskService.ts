import api from "@/interceptor/api";
import {
  CreatedBy,
  Task,
  TaskPriority,
  TaskSize,
  TaskStatus,
} from "@/types/project";
import { URLS } from "@/types/url-constants";

const exampleTask: Task = {
  taskid: "1",
  name: "Example Task",
  description: "This is an example task",
  status: TaskStatus.Created,
  Project: "123",
  details: "Details of the example task",
  priority: TaskPriority.Normal,
  size: TaskSize.Medium,
  related_work: [],
  created_by: CreatedBy.USER,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const taskService = {
  async getTasks(id: string): Promise<Task[]> {
    const response = await api.get<Task[]>(URLS.TASK);
    return response.data;
  },
  async createTask(task: any): Promise<any> {
    const response = await api.post<any>(URLS.TASK, task);
    return response.data;
  },
};

export default taskService;
