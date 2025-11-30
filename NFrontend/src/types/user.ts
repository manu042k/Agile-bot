export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone_number?: string | null;
  profile_pic?: string;
  avatar_url?: string;
  role?: string;  // User's professional role (e.g., Backend Engineer, Frontend Developer)
  is_active?: boolean;
  date_joined?: string;
  google_id?: string;
  username?: string; // For backward compatibility
}
