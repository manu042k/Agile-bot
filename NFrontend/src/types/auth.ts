export interface LoginResponse {
  refresh: string;
  access: string;
  user_id: number;
  user_name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
