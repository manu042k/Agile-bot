export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  phone_number: string;
  profile_pic?: string;
  is_active?: boolean;
}
