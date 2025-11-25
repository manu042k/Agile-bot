"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, Zap, Users, BarChart3, Sparkles, Monitor, Play, TrendingUp, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  // Landing page is accessible to all users
  // Navigation back from login/register pages works freely
  
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show content immediately on client-side mount to prevent blank page
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    // Use requestAnimationFrame to ensure refs are attached
    requestAnimationFrame(() => {
      if (heroRef.current) observer.observe(heroRef.current);
      if (featuresRef.current) observer.observe(featuresRef.current);
    });

    return () => {
      if (heroRef.current) observer.unobserve(heroRef.current);
      if (featuresRef.current) observer.unobserve(featuresRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      {/* Navigation */}
      <nav className="pm-glass border-b sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity group">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-orange-500/20 transition-all duration-300">
                <span className="text-lg font-bold text-white">AB</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Agile Bot
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="font-medium hover:text-orange-600 transition-colors">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-900/5 rounded-full blur-3xl animate-float delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
        
        <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className={`inline-flex items-center gap-2 px-4 py-2 pm-glass-orange rounded-full text-sm font-medium mb-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent">
                AI-Powered Project Management
              </span>
            </div>
            
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Manage Projects
              </span>
              <br />
              <span className="bg-gradient-to-r from-gray-900 via-orange-600 to-gray-900 bg-clip-text text-transparent">
                Smarter, Not Harder
              </span>
            </h1>
            
            <p className={`text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              Transform your project management with AI-powered task generation, real-time collaboration,
              and intelligent analytics. Built for modern teams who want to focus on what matters.
            </p>
            
            <div className={`flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              <Link href="/register">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-lg h-14 px-8 shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                  Start for Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600 transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className={`flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-600 pt-4 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              <div className="flex items-center gap-2 group">
                <CheckCircle className="w-5 h-5 text-green-600 group-hover:text-orange-600 transition-colors" />
                <span className="group-hover:text-gray-900 transition-colors">Free to start</span>
              </div>
              <div className="flex items-center gap-2 group">
                <CheckCircle className="w-5 h-5 text-green-600 group-hover:text-orange-600 transition-colors" />
                <span className="group-hover:text-gray-900 transition-colors">No credit card</span>
              </div>
              <div className="flex items-center gap-2 group">
                <CheckCircle className="w-5 h-5 text-green-600 group-hover:text-orange-600 transition-colors" />
                <span className="group-hover:text-gray-900 transition-colors">Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Right Column - Dashboard Preview */}
          <div className={`relative transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative pm-glass-card p-6 rounded-2xl shadow-2xl border border-gray-200/50 hover:shadow-orange-500/10 transition-all duration-500 hover:scale-[1.02]">
              {/* Mock Dashboard UI */}
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">AB</span>
                    </div>
                    <div>
                      <div className="h-3 w-24 bg-gray-900 rounded mb-2"></div>
                      <div className="h-2 w-16 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
                    <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="pm-glass-card p-3 rounded-lg">
                      <div className="h-2 w-12 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 w-8 bg-gray-900 rounded"></div>
                    </div>
                  ))}
                </div>
                
                {/* Task Cards */}
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="pm-glass-card p-4 rounded-lg border border-gray-200/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="h-3 w-32 bg-gray-900 rounded mb-2"></div>
                          <div className="h-2 w-24 bg-gray-300 rounded"></div>
                        </div>
                        <div className="w-16 h-6 bg-orange-500 rounded-full"></div>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                        <div className="h-2 w-20 bg-gray-300 rounded"></div>
                        <div className="h-2 w-16 bg-gray-300 rounded ml-auto"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gray-900/5 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
        <div className="text-center mb-20">
          <div className={`inline-block transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features to help your team collaborate and deliver faster
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <Card className="pm-glass-card p-8 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-3 group border border-gray-200/50">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500/10 to-orange-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:from-orange-500/20 group-hover:to-orange-600/30 transition-all duration-500 group-hover:scale-110">
              <Sparkles className="w-7 h-7 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
              AI Task Generation
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Upload your requirements and let AI automatically create detailed tasks for your project.
            </p>
          </Card>

          <Card className="pm-glass-card p-8 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-3 group border border-gray-200/50">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-900/10 to-gray-800/20 rounded-xl flex items-center justify-center mb-6 group-hover:from-orange-500/20 group-hover:to-orange-600/30 transition-all duration-500 group-hover:scale-110">
              <Users className="w-7 h-7 text-gray-900 group-hover:text-orange-600 transition-colors duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
              Team Collaboration
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Real-time updates, comments, and notifications keep everyone on the same page.
            </p>
          </Card>

          <Card className="pm-glass-card p-8 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-3 group border border-gray-200/50">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500/10 to-orange-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:from-orange-500/20 group-hover:to-orange-600/30 transition-all duration-500 group-hover:scale-110">
              <BarChart3 className="w-7 h-7 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
              Smart Analytics
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Track progress, identify bottlenecks, and make data-driven decisions with powerful analytics.
            </p>
          </Card>

          <Card className="pm-glass-card p-8 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-3 group border border-gray-200/50">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-900/10 to-gray-800/20 rounded-xl flex items-center justify-center mb-6 group-hover:from-orange-500/20 group-hover:to-orange-600/30 transition-all duration-500 group-hover:scale-110">
              <Zap className="w-7 h-7 text-gray-900 group-hover:text-orange-600 transition-colors duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
              Lightning Fast
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Optimized performance ensures smooth experience even with thousands of tasks.
            </p>
          </Card>

          <Card className="pm-glass-card p-8 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-3 group border border-gray-200/50">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500/10 to-orange-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:from-orange-500/20 group-hover:to-orange-600/30 transition-all duration-500 group-hover:scale-110">
              <CheckCircle className="w-7 h-7 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
              Kanban Boards
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Visualize your workflow with customizable Kanban boards and drag-and-drop interface.
            </p>
          </Card>

          <Card className="pm-glass-card p-8 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-3 group border border-gray-200/50">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-900/10 to-gray-800/20 rounded-xl flex items-center justify-center mb-6 group-hover:from-orange-500/20 group-hover:to-orange-600/30 transition-all duration-500 group-hover:scale-110">
              <Shield className="w-7 h-7 text-gray-900 group-hover:text-orange-600 transition-colors duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
              Secure & Reliable
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Enterprise-grade security with data encryption and regular backups for peace of mind.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-transparent to-orange-600/20 animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent)]" />
          
          <Card className="pm-glass-dark p-12 lg:p-16 text-center border-0 relative z-10 backdrop-blur-xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to transform your workflow?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of teams already using Agile Bot to deliver projects faster and smarter.
            </p>
            <Link href="/register" className="inline-block">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg h-14 px-10 shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 font-semibold">
                Get Started for Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t pm-glass mt-20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 mb-4 md:mb-0 hover:opacity-80 transition-opacity group">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-md group-hover:shadow-orange-500/20 transition-all duration-300">
                <span className="text-sm font-bold text-white">AB</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                Agile Bot
              </span>
            </Link>
            <p className="text-gray-600 text-sm">
              © 2025 Agile Bot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
