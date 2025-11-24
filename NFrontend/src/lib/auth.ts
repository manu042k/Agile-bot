/**
 * NextAuth.js helper functions and types
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import { Session } from 'next-auth';

export async function getSession(): Promise<Session | null> {
  return await getServerSession(authOptions);
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

