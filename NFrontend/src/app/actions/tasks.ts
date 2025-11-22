'use server';

/**
 * Server Actions for task mutations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CreateTaskData {
  title: string;
  description?: string;
  project?: number;
  status?: string;
  priority?: string;
  due_date?: string;
  assigned_to?: number[];
}

export async function createTaskAction(data: CreateTaskData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/project-management/tasks/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create task');
    }

    return { success: true, data: await response.json() };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create task' };
  }
}

export async function updateTaskAction(id: string, data: Partial<CreateTaskData>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/project-management/tasks-patch/${id}/`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update task');
    }

    return { success: true, data: await response.json() };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update task' };
  }
}

export async function deleteTaskAction(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/project-management/tasks/${id}/`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete task' };
  }
}

