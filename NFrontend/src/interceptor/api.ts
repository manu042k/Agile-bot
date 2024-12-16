import authService from "@/services/authService";
import { URLS } from "@/types/url-constants";
import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: URLS.BASE_URL,
});

// Get the CSRF token from the cookie
const csrfToken = Cookies.get("csrftoken");

// Set up Axios to include the CSRF token in request headers
api.defaults.headers.common["X-CSRFToken"] = csrfToken;

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = authService.getToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout();
      // Redirect to the login page after logout
      toast.error("Session expired. Please login again.");
      if (typeof window !== "undefined") {
        window.location.href = "/"; // This will perform a full page redirect
      }
    }
    return Promise.reject(error);
  }
);

export default api;
