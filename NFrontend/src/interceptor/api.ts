import authService from "@/services/authService";
import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/",
});

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
    }
    return Promise.reject(error);
  }
);

export default api;
