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

  async getSprint(projectId: string, sprintUuid: string): Promise<Sprint> {
    const response = await api.get<Sprint>(
      `${URLS.PROJECTS}${projectId}/sprints/${sprintUuid}/`
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
    sprintUuid: string,
    sprint: Partial<SprintDTO>
  ): Promise<Sprint> {
    const response = await api.patch<Sprint>(
      `${URLS.PROJECTS}${projectId}/sprints/${sprintUuid}/`,
      sprint
    );
    return response.data;
  },

  async deleteSprint(projectId: string, sprintUuid: string): Promise<void> {
    await api.delete(`${URLS.PROJECTS}${projectId}/sprints/${sprintUuid}/`);
  },

  async startSprint(projectId: string, sprintUuid: string): Promise<Sprint> {
    const response = await api.post<Sprint>(
      `${URLS.PROJECTS}${projectId}/sprints/${sprintUuid}/`,
      { action: 'start' }
    );
    return response.data;
  },

  async completeSprint(projectId: string, sprintUuid: string): Promise<Sprint> {
    const response = await api.post<Sprint>(
      `${URLS.PROJECTS}${projectId}/sprints/${sprintUuid}/`,
      { action: 'complete' }
    );
    return response.data;
  },
};

export default sprintService;

