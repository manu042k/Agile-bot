import api from "@/interceptor/api";
import { Sprint, SprintDTO } from "@/types/project";
import { URLS } from "@/types/url-constants";

const sprintService = {
  async getSprints(projectId: string): Promise<Sprint[]> {
    const response = await api.get<Sprint[]>(
      `${URLS.PROJECTS}${projectId}/sprints/`
    );
    return response.data;
  },

  async getSprint(projectId: string, sprintId: string): Promise<Sprint> {
    const response = await api.get<Sprint>(
      `${URLS.PROJECTS}${projectId}/sprints/${sprintId}/`
    );
    return response.data;
  },

  async createSprint(projectId: string, sprint: SprintDTO): Promise<Sprint> {
    const response = await api.post<Sprint>(
      `${URLS.PROJECTS}${projectId}/sprints/`,
      sprint
    );
    return response.data;
  },

  async updateSprint(
    projectId: string,
    sprintId: string,
    sprint: Partial<SprintDTO>
  ): Promise<Sprint> {
    const response = await api.patch<Sprint>(
      `${URLS.PROJECTS}${projectId}/sprints/${sprintId}/`,
      sprint
    );
    return response.data;
  },

  async deleteSprint(projectId: string, sprintId: string): Promise<void> {
    await api.delete(`${URLS.PROJECTS}${projectId}/sprints/${sprintId}/`);
  },

  async startSprint(projectId: string, sprintId: string): Promise<Sprint> {
    const response = await api.post<Sprint>(
      `${URLS.PROJECTS}${projectId}/sprints/${sprintId}/`,
      { action: 'start' }
    );
    return response.data;
  },

  async completeSprint(projectId: string, sprintId: string): Promise<Sprint> {
    const response = await api.post<Sprint>(
      `${URLS.PROJECTS}${projectId}/sprints/${sprintId}/`,
      { action: 'complete' }
    );
    return response.data;
  },
};

export default sprintService;

