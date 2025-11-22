'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

function SessionHandler({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Public routes
  const publicRoutes = ['/', '/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/reset-password');

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

