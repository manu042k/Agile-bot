import { URLS } from "@/types/url-constants";
import { User } from "@/types/user";
import axios from "axios";

const userRegisterService = {
  async register(user: User): Promise<string> {
    const response = await axios.post<string>(
      URLS.BASE_URL + URLS.REGISTER,
      user
    );
    return response.data;
  },
};

export default userRegisterService;
