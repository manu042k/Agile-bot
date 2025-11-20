"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Zap, Users, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  // Landing page is accessible to all users
  // Navigation back from login/register pages works freely

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">AB</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Agile Bot</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-black hover:bg-gray-800 text-white font-medium">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-900 rounded-full text-sm font-medium mb-4 border border-gray-200">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Project Management
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
            Manage Projects
            <br />
            <span className="text-gray-900">
              Smarter, Not Harder
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your project management with AI-powered task generation, real-time collaboration,
            and intelligent analytics. Built for modern teams who want to focus on what matters.
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="bg-black hover:bg-gray-800 text-white text-lg h-14 px-8">
                Start for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-2">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 pt-8">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              Free to start
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features to help your team collaborate and deliver faster
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-gray-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              AI Task Generation
            </h3>
            <p className="text-gray-600">
              Upload your requirements and let AI automatically create detailed tasks for your project.
            </p>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-gray-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Team Collaboration
            </h3>
            <p className="text-gray-600">
              Real-time updates, comments, and notifications keep everyone on the same page.
            </p>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6 text-gray-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Smart Analytics
            </h3>
            <p className="text-gray-600">
              Track progress, identify bottlenecks, and make data-driven decisions with powerful analytics.
            </p>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-gray-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Lightning Fast
            </h3>
            <p className="text-gray-600">
              Optimized performance ensures smooth experience even with thousands of tasks.
            </p>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle className="w-6 h-6 text-gray-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Kanban Boards
            </h3>
            <p className="text-gray-600">
              Visualize your workflow with customizable Kanban boards and drag-and-drop interface.
            </p>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-gray-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Team Management
            </h3>
            <p className="text-gray-600">
              Easily manage team members, permissions, and roles across all your projects.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="p-12 text-center bg-black border-0">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using Agile Bot to deliver projects faster and smarter.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 text-lg h-14 px-8">
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 mb-4 md:mb-0 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-white">AB</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Agile Bot</span>
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
