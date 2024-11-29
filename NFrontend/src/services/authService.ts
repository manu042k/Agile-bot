import api from "@/interceptor/api";
import { LoginResponse, LoginCredentials } from "./../types/auth";
import { URLS } from "@/types/url-constants";

const AUTH_TOKEN_KEY = "jwt_token";

const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(URLS.LOGIN, credentials);
    const JwtToken: LoginResponse = response.data;

    localStorage.setItem(AUTH_TOKEN_KEY, JwtToken.access);

    return response.data;
  },

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },

  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
};

export default authService;
