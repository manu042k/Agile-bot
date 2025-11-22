import api from "@/interceptor/api";
import { URLS } from "@/types/url-constants";
import axios from "axios";

interface GoogleAuthUrlResponse {
  auth_url: string;
}

interface GoogleCallbackResponse {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    google_id?: string;
  };
  message: string;
}

interface UserMeResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  google_id?: string;
}

const authService = {
  /**
   * Get Google OAuth URL and redirect user to Google
   */
  async getGoogleAuthUrl(): Promise<string> {
    try {
      const url = `${URLS.BASE_URL}${URLS.GOOGLE_LOGIN}`;
      console.log('[Google Login] Fetching OAuth URL from:', url);
      
      const response = await axios.get<GoogleAuthUrlResponse>(
        url,
        { 
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );
      
      console.log('[Google Login] Response status:', response.status);
      console.log('[Google Login] Response data:', response.data);
      
      if (!response.data?.auth_url) {
        console.error('[Google Login] No auth_url in response:', response.data);
        throw new Error('No auth_url in response');
      }
      
      const authUrl = response.data.auth_url;
      console.log('[Google Login] Successfully received auth URL, length:', authUrl.length);
      return authUrl;
    } catch (error: any) {
      console.error('[Google Login] Error getting OAuth URL:', error);
      
      if (error.code === 'ERR_NETWORK') {
        console.error('[Google Login] Network error - backend may be down or CORS issue');
        throw new Error('Cannot connect to server. Please make sure the backend is running on http://localhost:8000');
      }
      
      if (error.code === 'ECONNREFUSED') {
        console.error('[Google Login] Connection refused - backend is not running');
        throw new Error('Backend server is not running. Please start it on port 8000.');
      }
      
      if (error.response) {
        console.error('[Google Login] Error response:', {
          status: error.response.status,
          data: error.response.data,
        });
      }
      
      const message = 
        error.response?.data?.error || 
        error.response?.data?.detail ||
        error.message ||
        "Failed to get Google OAuth URL. Please check your connection and try again.";
      throw new Error(message);
    }
  },

  /**
   * Handle Google OAuth callback
   * This is called after user is redirected back from Google
   */
  async handleGoogleCallback(code: string): Promise<GoogleCallbackResponse> {
    try {
      const response = await axios.get<GoogleCallbackResponse>(
        `${URLS.BASE_URL}${URLS.GOOGLE_CALLBACK}?code=${code}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      const message = 
        error.response?.data?.error || 
        error.response?.data?.detail ||
        "Google authentication failed. Please try again.";
      throw new Error(message);
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<UserMeResponse> {
    try {
      const response = await api.get<UserMeResponse>(URLS.USER_ME);
      return response.data;
    } catch (error: any) {
      // Handle network errors gracefully
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Please check your connection.');
      }
      const message = 
        error.response?.data?.error || 
        error.response?.data?.detail ||
        "Failed to get user information.";
      throw new Error(message);
    }
  },

  /**
   * Logout user and clear session
   */
  async logout(): Promise<void> {
    try {
      await api.post(`${URLS.BASE_URL}${URLS.LOGOUT}`);
    } catch (error: any) {
      // Even if logout fails, clear local state
      console.error("Logout error:", error);
    } finally {
      // Clear any local storage or cookies
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
    }
  },

  /**
   * Check if user is authenticated
   * For session-based auth, we check by making a request to /auth/me
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  },
};

export default authService;
