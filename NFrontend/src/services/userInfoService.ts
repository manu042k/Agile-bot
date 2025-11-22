import api from "@/interceptor/api";
import { URLS } from "@/types/url-constants";
import { User } from "@/types/user";

const userInfoService = {
  async getUserInfo(): Promise<User> {
    // Use the new auth/me endpoint for session-based auth
    const response = await api.get<User>(URLS.USER_ME);
    return response.data;
  },
  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>(URLS.USERS);
    return response.data;
  },
};

export default userInfoService;
