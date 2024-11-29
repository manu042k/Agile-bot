import { URLS } from "@/types/url-constants";
import { User } from "@/types/user";
import axios from "axios";

const userRegisterService = {
  async register(user: User): Promise<string> {
    console.log("user", user);
    const response = await axios.post<string>(URLS.REGISTER, user);
    return response.data;
  },
};

export default userRegisterService;
