import api from "@/interceptor/api";
import { LoginResponse, LoginCredentials } from "./../types/auth";
import { URLS } from "@/types/url-constants";
import Cookies from "js-cookie";
import axios from "axios";

const AUTH_TOKEN_KEY = "jwt_token";
const REFRESH_TOKEN_KEY = "refresh_token";

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

interface GoogleAuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    name: string;
    picture?: string;
  };
}

const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>(URLS.LOGIN, credentials);
      const JwtToken: LoginResponse = response.data;

      // Store tokens
      this.setTokens(JwtToken.access, JwtToken.refresh);

      return response.data;
    } catch (error: any) {
      const message = 
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.response?.data?.error ||
        "Login failed. Please check your credentials.";
      throw new Error(message);
    }
  },

  async register(credentials: RegisterCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${URLS.BASE_URL}/api/accounts/register/`,
        credentials
      );

      // Auto-login after registration
      if (response.data.access) {
        this.setTokens(response.data.access, response.data.refresh);
      }

      return response.data;
    } catch (error: any) {
      const message = 
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.response?.data?.email?.[0] ||
        "Registration failed. Please try again.";
      throw new Error(message);
    }
  },

  async googleLogin(credential: string): Promise<GoogleAuthResponse> {
    try {
      const response = await axios.post<GoogleAuthResponse>(
        `${URLS.BASE_URL}/api/accounts/google-login/`,
        { credential }
      );

      if (response.data.access) {
        this.setTokens(response.data.access, response.data.refresh);
      }

      return response.data;
    } catch (error: any) {
      const message = 
        error.response?.data?.detail || 
        error.response?.data?.message || 
        "Google login failed. Please try again.";
      throw new Error(message);
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await axios.post(
        `${URLS.BASE_URL}/api/accounts/forgot-password/`,
        { email }
      );
      return response.data;
    } catch (error: any) {
      const message = 
        error.response?.data?.detail || 
        error.response?.data?.message || 
        "Failed to send reset email. Please try again.";
      throw new Error(message);
    }
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      const response = await axios.post(
        `${URLS.BASE_URL}/api/accounts/reset-password/`,
        { token, password }
      );
      return response.data;
    } catch (error: any) {
      const message = 
        error.response?.data?.detail || 
        error.response?.data?.message || 
        "Failed to reset password. The link may have expired.";
      throw new Error(message);
    }
  },

  setTokens(accessToken: string, refreshToken: string) {
    // Store in localStorage
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    
    // Store in cookies for SSR
    Cookies.set(AUTH_TOKEN_KEY, accessToken, { 
      expires: 7, // 7 days
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { 
      expires: 30, // 30 days
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
  },

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    Cookies.remove(AUTH_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    // Check both localStorage and cookie
    const localToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const cookieToken = Cookies.get(AUTH_TOKEN_KEY);
    return !!(localToken || cookieToken);
  },

  getToken(): string | null {
    // Try localStorage first, then cookie
    return localStorage.getItem(AUTH_TOKEN_KEY) || Cookies.get(AUTH_TOKEN_KEY) || null;
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || Cookies.get(REFRESH_TOKEN_KEY) || null;
  },
};

export default authService;
