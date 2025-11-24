'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import authService from '@/services/authService';

function SessionHandler({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const hasSyncedRef = useRef(false);

  // Public routes
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/invitations/accept'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/reset-password');

  // Sync with Django after NextAuth login
  useEffect(() => {
    const syncWithDjango = async () => {
      // Only sync if we have a session and haven't synced yet
      if (
        status === 'authenticated' &&
        session?.user &&
        !hasSyncedRef.current
      ) {
        // Add a small delay to ensure backend is ready
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          // Get Google ID from the session (stored in token.sub)
          const googleId = (session.user as any).id;
          const email = session.user.email;

          if (googleId && email) {
            console.log('[Django Sync] Syncing user with Django backend...');
            await authService.syncWithDjango(googleId, email);
            hasSyncedRef.current = true;
            console.log('[Django Sync] Successfully synced with Django');
          } else {
            console.warn('[Django Sync] Missing googleId or email in session');
          }
        } catch (error: any) {
          console.error('[Django Sync] Failed to sync with Django:', error);
          // Don't show toast for sync errors - it's a background operation
          // The user can still use the app, but API calls might fail
          // We'll retry on the next API call if needed
        }
      }
    };

    syncWithDjango();
  }, [status, session]);

  // Reset sync flag when session is lost
  useEffect(() => {
    if (status === 'unauthenticated') {
      hasSyncedRef.current = false;
    }
  }, [status]);

  useEffect(() => {
    // Handle session expiration - redirect to login
    if (!isPublicRoute && status === 'unauthenticated') {
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    }
  }, [status, isPublicRoute, pathname, router]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes to check expiration
      refetchOnWindowFocus={true} // Refetch when window regains focus
    >
      <SessionHandler>{children}</SessionHandler>
    </SessionProvider>
  );
}

