import api from "@/interceptor/api";
import { URLS } from "@/types/url-constants";

export interface UserPreferences {
  id: number;
  email_notifications: boolean;
  task_assignments: boolean;
  project_updates: boolean;
  deadline_reminders: boolean;
  team_mentions: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'es' | 'fr';
  timezone: string;
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  updated_at: string;
}

const preferencesService = {
  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    const response = await api.get<UserPreferences>(URLS.USER_PREFERENCES);
    return response.data;
  },

  /**
   * Update user preferences
   */
  async updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await api.patch<UserPreferences>(URLS.USER_PREFERENCES, data);
    return response.data;
  },
};

export default preferencesService;
