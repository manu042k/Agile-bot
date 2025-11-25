import { URLS } from "@/types/url-constants";
import axios from "axios";

interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

const userRegisterService = {
  async register(data: RegisterData): Promise<string> {
    const response = await axios.post<string>(
      URLS.BASE_URL + URLS.REGISTER,
      data
    );
    return response.data;
  },
};

export default userRegisterService;
