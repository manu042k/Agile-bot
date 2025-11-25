'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Redirect to login since Google SSO doesn't use passwords
  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 via-white to-orange-50/30 relative">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-gray-900/5 rounded-full blur-3xl animate-float delay-200" />
      
      <Card className="pm-glass-card w-full max-w-md p-8 relative z-10 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-lg mb-4 shadow-lg">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Redirecting...
          </h2>
          <p className="text-gray-600 mb-6">
            Password reset is not available with Google SSO. Redirecting to login page.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to login page
          </Link>
        </div>
      </Card>
    </div>
  );
}
