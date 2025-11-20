import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Agile Bot',
  description: 'Sign in or create an account to access Agile Bot',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
