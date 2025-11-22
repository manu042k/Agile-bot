'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Mail, Lock, User, Loader2, Chrome, Check, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import authService from '@/services/authService';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Navigation - use Link components for better Next.js navigation

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success('Account created successfully!');
      router.replace('/projects');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      toast('Google sign up will be implemented with backend OAuth flow', {
        icon: 'ℹ️',
      });
    } catch (error: any) {
      toast.error(error.message || 'Google sign up failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^a-zA-Z\d]/.test(pass)) strength++;

    if (strength <= 1) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
    if (strength === 2) return { strength: 50, label: 'Fair', color: 'bg-orange-500' };
    if (strength === 3) return { strength: 75, label: 'Good', color: 'bg-yellow-500' };
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated Decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative z-10 animate-fade-in">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity group">
            <h1 className="text-4xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
              Join Agile Bot
            </h1>
            <p className="text-gray-400 text-lg">Start your journey to better project management</p>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-start space-x-4 animate-fade-in delay-100 group">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-orange-500/30 group-hover:bg-orange-500/30 transition-all duration-300">
              <Check className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-orange-400 transition-colors">Free to start</h3>
              <p className="text-gray-400 text-sm">
                Get started with our free plan and upgrade as you grow.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 animate-fade-in delay-200 group">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-orange-500/30 group-hover:bg-orange-500/30 transition-all duration-300">
              <Check className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-orange-400 transition-colors">No credit card required</h3>
              <p className="text-gray-400 text-sm">
                Start using Agile Bot immediately without any payment information.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 animate-fade-in delay-300 group">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-orange-500/30 group-hover:bg-orange-500/30 transition-all duration-300">
              <Check className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-orange-400 transition-colors">24/7 Support</h3>
              <p className="text-gray-400 text-sm">
                Our team is here to help you succeed every step of the way.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 animate-fade-in delay-400">
          <p className="text-gray-400 text-sm">
            Trusted by over 10,000+ teams worldwide
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
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
            <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-lg mb-4 shadow-lg group-hover:shadow-orange-500/20 transition-all duration-300">
                <span className="text-2xl font-bold text-white">AB</span>
              </div>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-gray-600">
              Get started with Agile Bot today
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10 h-11"
                  {...register('name')}
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 h-11"
                  {...register('email')}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11"
                  {...register('password')}
                  disabled={isLoading}
                />
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Password strength</span>
                    <span className={`font-medium ${
                      passwordStrength.strength === 100 ? 'text-green-600' :
                      passwordStrength.strength === 75 ? 'text-yellow-600' :
                      passwordStrength.strength === 50 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11"
                  {...register('confirmPassword')}
                  disabled={isLoading}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <p className="text-xs text-gray-600">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-gray-900 hover:text-orange-600 font-medium transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-gray-900 hover:text-orange-600 font-medium transition-colors">
                Privacy Policy
              </Link>
            </p>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-black hover:bg-gray-800 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <Separator />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-500">
              Or sign up with
            </span>
          </div>

          {/* Google Sign Up */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600 transition-all duration-300 hover:scale-[1.02]"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-5 w-5 text-gray-900" />
            )}
            <span className="font-medium text-gray-700">Sign up with Google</span>
          </Button>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-gray-900 hover:text-orange-600 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
