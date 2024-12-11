import api from "@/interceptor/api";
import { Team, TeamDTO } from "@/types/project";
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
  async addMember(teamId: number, user: any): Promise<string> {
    const response = await api.post<string>(
      `${URLS.TEAMS}${teamId}${URLS.ADD_MEMBER}`,
      user
    );
    return response.data;
  },
  async removeMember(teamId: number, user: any): Promise<string> {
    const response = await api.delete<string>(
      `${URLS.TEAMS}${teamId}${URLS.REMOVE_MEMBER}` + user + "/"
    );
    return response.data;
  },
};

export default teamService;
