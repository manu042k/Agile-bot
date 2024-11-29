import api from "@/interceptor/api";
import { Project, ProjectDTO } from "@/types/project";
import { URLS } from "@/types/url-constants";

const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await api.get<Project[]>(URLS.PROJECTS);
    return response.data;
  },

  async createProject(project: ProjectDTO): Promise<Project> {
    const response = await api.post<Project>(URLS.PROJECTS, project);
    return response.data;
  },

  async updateProject(project: Project): Promise<Project> {
    const response = await api.put<Project>(
      `${URLS.PROJECTS}${project.id}/`,
      project
    );
    return response.data;
  },
  async deleteProject(projectId: number): Promise<void> {
    await api.delete(`${URLS.PROJECTS}${projectId}/`);
  },
  async getProject(projectId: number): Promise<Project> {
    const response = await api.get<Project>(`${URLS.PROJECTS}${projectId}/`);
    return response.data;
  },
};

export default projectService;
