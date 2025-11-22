'use server';

/**
 * Server Actions for project mutations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CreateProjectData {
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  start_date?: string;
  end_date?: string;
}

export async function createProjectAction(data: CreateProjectData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/project-management/projects/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create project');
    }

    return { success: true, data: await response.json() };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create project' };
  }
}

export async function updateProjectAction(id: string, data: Partial<CreateProjectData>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/project-management/projects/${id}/`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update project');
    }

    return { success: true, data: await response.json() };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update project' };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/project-management/projects/${id}/`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete project');
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete project' };
  }
}

