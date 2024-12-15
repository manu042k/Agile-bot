import api from "@/interceptor/api";
import { ProjectItem } from "@/types/project";
import { URLS } from "@/types/url-constants";

const fileUploadService = {
  async uploadFile(formData: any, csrfToken: any): Promise<any> {
    const response = await api.post<any>(URLS.PROJECTS_UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-CSRFToken": csrfToken,
      },
    });
    return response.data;
  },

  async viewFile(project: string): Promise<ProjectItem> {
    const response = await api.post<ProjectItem>(URLS.PROJECTS_VIEW, {
      project,
    });
    console.log(response.data);
    return response.data;
  },
};

export default fileUploadService;
