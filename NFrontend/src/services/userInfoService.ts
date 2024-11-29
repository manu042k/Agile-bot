import api from "@/interceptor/api";
import { URLS } from "@/types/url-constants";
import { User } from "@/types/user";

const userInfoService = {
  async getUserInfo(): Promise<User> {
    const response = await api.get<User>(URLS.USER_INFO);
    return response.data;
  },
};

export default userInfoService;
