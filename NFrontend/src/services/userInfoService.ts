import api from "@/interceptor/api";
import { URLS } from "@/types/url-constants";
import { User } from "@/types/user";

const userInfoService = {
  async getUserInfo(): Promise<User> {
    // Use the new auth/me endpoint for session-based auth
    const response = await api.get<User>(URLS.USER_ME);
    return response.data;
  },
  async getUsers(search?: string, isActive?: boolean): Promise<User[]> {
    // Get users with optional search and filtering
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (isActive !== undefined) params.append('is_active', isActive.toString());
    
    const url = params.toString() 
      ? `${URLS.USERS}?${params.toString()}`
      : URLS.USERS;
    
    const response = await api.get<User[]>(url);
    return response.data;
  },
  async getUserById(userId: number | string): Promise<User> {
    // Get specific user by ID
    const response = await api.get<User>(`${URLS.USER_DETAIL}${userId}/`);
    return response.data;
  },
  async updateUserInfo(data: { phone_number?: string; role?: string }): Promise<User> {
    // Update user information (phone_number and role are editable)
    const response = await api.patch<User>(URLS.USER_PROFILE_UPDATE, data);
    return response.data;
  },
};

export default userInfoService;
