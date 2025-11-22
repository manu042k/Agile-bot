"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, Chrome, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      // Get callback URL from query params or default to projects
      const callbackUrl = searchParams.get("callbackUrl") || "/projects";
      router.replace(callbackUrl);
    }
  }, [status, session, router, searchParams]);

  // Handle OAuth callback errors
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error("Authentication failed. Please try again.");
      router.replace("/login");
    }
  }, [searchParams, router]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      // Use NextAuth.js signIn with Google provider
      const result = await signIn("google", {
        callbackUrl: "/projects",
        redirect: true, // NextAuth will handle the redirect
      });

      // If redirect is false, there was an error
      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error(
        error.message || "Failed to initiate Google login. Please try again."
      );
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated Decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl animate-pulse" />

        <div className="relative z-10 animate-fade-in">
          <Link
            href="/"
            className="inline-block hover:opacity-80 transition-opacity group"
          >
            <h1 className="text-4xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
              Agile Bot
            </h1>
            <p className="text-gray-400 text-lg">
              Your Smart Project Management Assistant
            </p>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="pm-glass-dark rounded-lg p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300 hover:scale-105 animate-fade-in delay-100">
            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-orange-400">
              AI-Powered Task Generation
            </h3>
            <p className="text-gray-400">
              Upload your requirements and let AI create your project tasks
              automatically.
            </p>
          </div>

          <div className="pm-glass-dark rounded-lg p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300 hover:scale-105 animate-fade-in delay-200">
            <h3 className="text-xl font-semibold text-white mb-2">
              Real-Time Collaboration
            </h3>
            <p className="text-gray-400">
              Work together seamlessly with your team in real-time with instant
              updates.
            </p>
          </div>

          <div className="pm-glass-dark rounded-lg p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300 hover:scale-105 animate-fade-in delay-300">
            <h3 className="text-xl font-semibold text-white mb-2">
              Smart Analytics
            </h3>
            <p className="text-gray-400">
              Track progress and gain insights with powerful analytics and
              reporting tools.
            </p>
          </div>
        </div>

        <div className="relative z-10 animate-fade-in delay-400">
          <p className="text-gray-400 text-sm">
            © 2025 Agile Bot. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Background decorative elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-gray-900/5 rounded-full blur-3xl animate-float delay-200" />

        <Card className="pm-glass-card w-full max-w-md p-8 relative z-10 animate-fade-in">
          {/* Back to Home Link */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
          </div>

          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-block mb-4 hover:opacity-80 transition-opacity group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-lg mb-4 shadow-lg group-hover:shadow-orange-500/20 transition-all duration-300">
                <span className="text-2xl font-bold text-white">AB</span>
              </div>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Google Sign In - Only authentication method */}
          <div className="space-y-4">
            <Button
              type="button"
              className="w-full h-11 bg-black hover:bg-gray-800 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] group"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Redirecting to Google...
                </>
              ) : (
                <>
                  <Chrome className="mr-2 h-5 w-5" />
                  Sign in with Google
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Secure login
              </span>
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Privacy protected
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
