import { useState, useEffect } from "react";
import userInfoService from "@/services/userInfoService";
import { User } from "@/types/user";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userInfoService.getUserInfo();
      setUser(response);
    } catch (err: any) {
      console.error("Failed to fetch user:", err);
      setError(err);
      // Don't show toast for auth errors - handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
};
