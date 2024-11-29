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
    const response = await api.put<Team>(`${URLS.TEAMS}${team.id}/`, team);
    return response.data;
  },
  async deleteTeam(teamId: number): Promise<void> {
    await api.delete(`${URLS.TEAMS}${teamId}/`);
  },
  async getTeam(teamId: number): Promise<Team> {
    const response = await api.get<Team>(`${URLS.TEAMS}${teamId}/`);
    return response.data;
  },

  //todo
  async addMember(teamId: number, user: any): Promise<string> {
    const response = await api.post<string>(
      `${URLS.TEAMS}${teamId}/add-member/`,
      user
    );
    return response.data;
  },
};

export default teamService;
