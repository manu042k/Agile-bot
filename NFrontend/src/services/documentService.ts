import api from "@/interceptor/api";

export interface Document {
  id: number;
  uuid: string;
  project: number;
  project_name?: string;
  file: string;
  file_url: string;
  name: string;
  category?: string;
  uploaded_by?: number;
  uploaded_by_email?: string;
  file_size?: number;
  created_at: string;
  updated_at: string;
}

const documentService = {
  async getAllDocuments(): Promise<Document[]> {
    const response = await api.get<Document[]>(
      `/api/project-management/documents/`
    );
    return response.data;
  },

  async getDocuments(projectId: string): Promise<Document[]> {
    const response = await api.get<Document[]>(
      `/api/project-management/projects/${projectId}/documents/`
    );
    return response.data;
  },

  async uploadDocuments(
    projectId: string,
    files: File[],
    category?: string
  ): Promise<{ documents: Document[]; message: string }> {
    const formData = new FormData();
    
    // Add multiple files
    files.forEach((file) => {
      formData.append("files", file);
    });
    
    if (category) {
      formData.append("category", category);
    }

    const response = await api.post<{ documents: Document[]; message: string }>(
      `/api/project-management/projects/${projectId}/documents/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  async updateDocument(
    projectId: string,
    documentUuid: string,
    data: { name?: string; category?: string }
  ): Promise<Document> {
    const response = await api.patch<Document>(
      `/api/project-management/projects/${projectId}/documents/${documentUuid}/`,
      data
    );
    return response.data;
  },

  async deleteDocument(projectId: string, documentUuid: string): Promise<void> {
    await api.delete(
      `/api/project-management/projects/${projectId}/documents/${documentUuid}/`
    );
  },
};

export default documentService;

