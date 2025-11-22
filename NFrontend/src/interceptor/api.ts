import { URLS } from "@/types/url-constants";
import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: URLS.BASE_URL,
  withCredentials: true, // Important: Include cookies in requests for session auth
  timeout: 10000, // 10 second timeout
});

// Get the CSRF token from the cookie (optional for session auth)
const csrfToken = Cookies.get("csrftoken");

// Set up Axios to include the CSRF token in request headers (if available)
if (csrfToken) {
  api.defaults.headers.common["X-CSRFToken"] = csrfToken;
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // For session-based auth, we don't need to set Authorization header
    // The session cookie is automatically sent with withCredentials: true
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Handle network errors gracefully
    if (error.code === "ERR_NETWORK") {
      console.error("Network error - backend may be down or CORS issue");
      // Don't show toast for network errors on public pages
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const isPublicPage =
          currentPath === "/" ||
          currentPath === "/login" ||
          currentPath === "/register" ||
          currentPath.startsWith("/reset-password");
        if (!isPublicPage) {
          toast.error(
            "Cannot connect to server. Please check your connection."
          );
        }
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      // Session expired or invalid
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        // Don't redirect if already on login/register/home page or during OAuth callback
        const isAuthPage =
          currentPath === "/" ||
          currentPath === "/login" ||
          currentPath === "/register" ||
          currentPath.startsWith("/reset-password");
        const isOAuthCallback =
          currentPath === "/projects" &&
          new URL(window.location.href).searchParams.get("auth") === "success";

        if (!isAuthPage && !isOAuthCallback) {
          toast.error("Session expired. Please login again.");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
