/**
 * API utility functions for Server Components
 * Uses native fetch with proper cookie handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Server-side API fetch with session cookie support
 * Note: In Server Components, cookies from the request are automatically included
 */
export async function serverFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
  cookies?: string
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;
  
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}/${endpoint.replace(/^\//, '')}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Include cookies in request if provided (from Server Component)
  if (cookies) {
    (headers as Record<string, string>)['Cookie'] = cookies;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include', // Important for session cookies
    cache: requireAuth ? 'no-store' : 'default',
  });

  if (!response.ok) {
    if (response.status === 401 && requireAuth) {
      throw new Error('Unauthorized');
    }
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get current authenticated user (Server Component)
 * Usage: const user = await getCurrentUser(cookies().toString());
 */
export async function getCurrentUser(cookieHeader?: string) {
  try {
    return await serverFetch('api/accounts/auth/me/', {}, cookieHeader);
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is authenticated (Server Component)
 */
export async function isAuthenticated(cookieHeader?: string): Promise<boolean> {
  try {
    await serverFetch('api/accounts/auth/me/', {}, cookieHeader);
    return true;
  } catch {
    return false;
  }
}

