import api from "@/interceptor/api";
import { Team, TeamDTO, TeamMemberRole } from "@/types/project";
import { URLS } from "@/types/url-constants";

const teamService = {
  async getTeams(): Promise<Team[]> {
    const response = await api.get<Team[]>(URLS.TEAMS);
    return response.data;
  },

  async createTeam(team: TeamDTO): Promise<Team> {
    const response = await api.post<Team>(URLS.TEAMS, team);
    return response.data;
  },
  async updateTeam(team: Team): Promise<Team> {
    const response = await api.patch<Team>(`${URLS.TEAMS}${team.id}/`, team);
    return response.data;
  },
  async deleteTeam(teamId: string): Promise<void> {
    await api.delete(`${URLS.TEAMS}${teamId}/`);
  },
  async getTeam(teamId: string): Promise<Team> {
    const response = await api.get<Team>(`${URLS.TEAMS}${teamId}/`);
    return response.data;
  },
  async addMember(teamId: number, data: { user_email: string; role: string }): Promise<any> {
    const response = await api.post(
      `${URLS.TEAMS}${teamId}${URLS.ADD_MEMBER}`,
      data
    );
    return response.data;
  },
  async removeMember(teamId: number, user: any): Promise<string> {
    const response = await api.delete<string>(
      `${URLS.TEAMS}${teamId}${URLS.REMOVE_MEMBER}` + user + "/"
    );
    return response.data;
  },

  async updateTeamMemberRole(
    teamId: number,
    memberId: number | string,
    role: TeamMemberRole
  ): Promise<Team> {
    const response = await api.patch<Team>(
      `${URLS.TEAMS}${teamId}${URLS.UPDATE_MEMBER_ROLE}${memberId}/`,
      { role }
    );
    return response.data;
  },
  async inviteMember(
    teamId: number,
    email: string,
    role: TeamMemberRole
  ): Promise<any> {
    console.log('[Invite] Sending invitation:', { teamId, email, role });
    console.log('[Invite] URL:', `${URLS.TEAMS}${teamId}${URLS.INVITE_MEMBER}`);
    try {
      const response = await api.post(
        `${URLS.TEAMS}${teamId}${URLS.INVITE_MEMBER}`,
        { email, role }
      );
      console.log('[Invite] Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[Invite] Error:', error);
      console.error('[Invite] Response:', error.response?.data);
      throw error;
    }
  },
  async acceptInvitation(token: string): Promise<any> {
    const response = await api.post(URLS.ACCEPT_INVITATION, { token });
    return response.data;
  },
};

export default teamService;
