import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import userInfoService from '@/services/userInfoService';
import { User } from '@/types/user';

export const useUser = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Public pages where we don't need to fetch user
  const authPages = ["/", "/login", "/register", "/forgot-password"];
  const isPublicPage = authPages.includes(pathname) || pathname.startsWith("/reset-password");

  const fetchUser = async () => {
    // Skip API call on public pages
    if (isPublicPage) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await userInfoService.getUserInfo();
      setUser(response);
    } catch (err: any) {
      // Silently handle errors - expected on public pages or when not authenticated
      setUser(null);
      setError(err);
      // Only log errors that aren't network/401 (which are expected)
      if (err.code !== 'ERR_NETWORK' && err.response?.status !== 401) {
        console.error('Failed to fetch user:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]); // Re-fetch when route changes

  return { 
    user, 
    loading, 
    error, 
    refetch: fetchUser 
  };
};
