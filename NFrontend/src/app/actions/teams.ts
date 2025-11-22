'use server';

/**
 * Server Actions for team mutations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CreateTeamData {
  name: string;
  description?: string;
}

export async function createTeamAction(data: CreateTeamData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/accounts/teams/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create team');
    }

    return { success: true, data: await response.json() };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create team' };
  }
}

export async function updateTeamAction(id: string, data: Partial<CreateTeamData>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/accounts/teams/${id}/`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update team');
    }

    return { success: true, data: await response.json() };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update team' };
  }
}

export async function deleteTeamAction(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/accounts/teams/${id}/`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete team');
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete team' };
  }
}

export async function addTeamMemberAction(teamId: number, userEmail: string, role: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/accounts/teams/${teamId}/add-member/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_email: userEmail, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Failed to add team member');
    }

    return { success: true, data: await response.json() };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add team member' };
  }
}

export async function removeTeamMemberAction(teamId: number, userId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/accounts/teams/${teamId}/remove-member/${userId}/`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Failed to remove team member');
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove team member' };
  }
}

