"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Zap, Users, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  // Landing page is accessible to all users
  // Navigation back from login/register pages works freely

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
                <Button className="bg-black hover:bg-gray-800 text-white font-medium shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-900/5 rounded-full blur-3xl animate-float delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
        
        <div className="text-center space-y-8 relative z-10">
          <div className="inline-flex items-center px-4 py-2 pm-glass-orange rounded-full text-sm font-medium mb-4 animate-fade-in">
            <Sparkles className="w-4 h-4 mr-2 text-orange-600" />
            <span className="bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent">
              AI-Powered Project Management
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in delay-200">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Manage Projects
            </span>
            <br />
            <span className="bg-gradient-to-r from-gray-900 via-orange-600 to-gray-900 bg-clip-text text-transparent animate-gradient">
              Smarter, Not Harder
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-300">
            Transform your project management with AI-powered task generation, real-time collaboration,
            and intelligent analytics. Built for modern teams who want to focus on what matters.
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-4 animate-fade-in delay-400">
            <Link href="/register">
              <Button size="lg" className="bg-black hover:bg-gray-800 text-white text-lg h-14 px-8 shadow-xl hover:shadow-orange-500/20 transition-all duration-300 hover:scale-105">
                Start for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600 transition-all duration-300 hover:scale-105">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 pt-8 animate-fade-in delay-500">
            <div className="flex items-center group">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 group-hover:text-orange-600 transition-colors" />
              <span className="group-hover:text-gray-900 transition-colors">Free to start</span>
            </div>
            <div className="flex items-center group">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 group-hover:text-orange-600 transition-colors" />
              <span className="group-hover:text-gray-900 transition-colors">No credit card required</span>
            </div>
            <div className="flex items-center group">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 group-hover:text-orange-600 transition-colors" />
              <span className="group-hover:text-gray-900 transition-colors">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features to help your team collaborate and deliver faster
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="pm-glass-card p-8 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-2 group animate-fade-in delay-100">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/10 to-orange-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:from-orange-500/20 group-hover:to-orange-600/30 transition-all duration-300">
              <Sparkles className="w-6 h-6 text-orange-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
              AI Task Generation
            </h3>
            <p className="text-gray-600">
              Upload your requirements and let AI automatically create detailed tasks for your project.
            </p>
          </Card>

          <Card className="pm-glass-card p-8 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-2 group animate-fade-in delay-200">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-900/10 to-gray-800/20 rounded-xl flex items-center justify-center mb-6 group-hover:from-orange-500/20 group-hover:to-orange-600/30 transition-all duration-300">
              <Users className="w-6 h-6 text-gray-900 group-hover:text-orange-600 transition-colors group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
              Team Collaboration
            </h3>
            <p className="text-gray-600">
              Real-time updates, comments, and notifications keep everyone on the same page.
            </p>
          </Card>

          <Card className="pm-glass-card p-8 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-2 group animate-fade-in delay-300">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/10 to-orange-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:from-orange-500/20 group-hover:to-orange-600/30 transition-all duration-300">
              <BarChart3 className="w-6 h-6 text-orange-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
              Smart Analytics
            </h3>
            <p className="text-gray-600">
              Track progress, identify bottlenecks, and make data-driven decisions with powerful analytics.
            </p>
          </Card>

          <Card className="pm-glass-card p-8 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-2 group animate-fade-in delay-400">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-900/10 to-gray-800/20 rounded-xl flex items-center justify-center mb-6 group-hover:from-orange-500/20 group-hover:to-orange-600/30 transition-all duration-300">
              <Zap className="w-6 h-6 text-gray-900 group-hover:text-orange-600 transition-colors group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
              Lightning Fast
            </h3>
            <p className="text-gray-600">
              Optimized performance ensures smooth experience even with thousands of tasks.
            </p>
          </Card>

          <Card className="pm-glass-card p-8 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-2 group animate-fade-in delay-500">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/10 to-orange-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:from-orange-500/20 group-hover:to-orange-600/30 transition-all duration-300">
              <CheckCircle className="w-6 h-6 text-orange-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
              Kanban Boards
            </h3>
            <p className="text-gray-600">
              Visualize your workflow with customizable Kanban boards and drag-and-drop interface.
            </p>
          </Card>

          <Card className="pm-glass-card p-8 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-2 group animate-fade-in delay-500">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-900/10 to-gray-800/20 rounded-xl flex items-center justify-center mb-6 group-hover:from-orange-500/20 group-hover:to-orange-600/30 transition-all duration-300">
              <Users className="w-6 h-6 text-gray-900 group-hover:text-orange-600 transition-colors group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
              Team Management
            </h3>
            <p className="text-gray-600">
              Easily manage team members, permissions, and roles across all your projects.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="relative overflow-hidden rounded-2xl">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 animate-gradient" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-transparent to-orange-600/20 animate-pulse" />
          
          <Card className="pm-glass-dark p-12 text-center border-0 relative z-10 backdrop-blur-xl">
            <h2 className="text-4xl font-bold text-white mb-4 animate-fade-in">
              Ready to transform your workflow?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in delay-200">
              Join thousands of teams already using Agile Bot to deliver projects faster and smarter.
            </p>
            <Link href="/register" className="inline-block animate-fade-in delay-300">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg h-14 px-8 shadow-xl hover:shadow-orange-500/20 transition-all duration-300 hover:scale-105">
                Get Started for Free
                <ArrowRight className="ml-2 w-5 h-5" />
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
