"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { HelpCircle, Book, MessageCircle, FileText, Sparkles, ChevronRight, Search } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import Link from "next/link";

// Mock FAQ data
const mockFAQs = [
  {
    id: 1,
    question: "How do I create a new project?",
    answer: "To create a new project, click on the 'New Project' button on the Projects page. Fill in the project details including name, description, and team members, then click 'Create'.",
    category: "Projects",
  },
  {
    id: 2,
    question: "How can I assign tasks to team members?",
    answer: "You can assign tasks by opening a task and clicking on the 'Assignees' section. Select team members from the dropdown list and they will be notified.",
    category: "Tasks",
  },
  {
    id: 3,
    question: "Can I export project data?",
    answer: "Yes, you can export project data by going to the project settings and clicking on 'Export Project Data'. You can choose to export as CSV or PDF.",
    category: "Projects",
  },
  {
    id: 4,
    question: "How do I set up notifications?",
    answer: "Go to Settings > Notifications to configure your notification preferences. You can choose to receive email notifications, in-app notifications, or both.",
    category: "Settings",
  },
  {
    id: 5,
    question: "What is the difference between a project and a team?",
    answer: "A project is a collection of tasks and work items, while a team is a group of users who can be assigned to multiple projects. Teams help organize people, while projects organize work.",
    category: "General",
  },
];

const categories = ["All", "Projects", "Tasks", "Teams", "Settings", "General"];

// Mock documentation sections
const documentationSections = [
  { id: 1, title: "Getting Started", icon: Book, description: "Learn the basics" },
  { id: 2, title: "Projects", icon: FileText, description: "Manage your projects" },
  { id: 3, title: "Tasks", icon: FileText, description: "Create and assign tasks" },
  { id: 4, title: "Teams", icon: FileText, description: "Organize your team" },
  { id: 5, title: "Analytics", icon: FileText, description: "Track performance" },
  { id: 6, title: "Integrations", icon: FileText, description: "Connect tools" },
];

export default function HelpPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "faq";
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const filteredFAQs = mockFAQs.filter((faq) => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Help & Support"
        description="Find answers and get support"
        icon={HelpCircle}
        tabs={[
          { icon: HelpCircle, label: "FAQ", href: "/help" },
          { icon: Book, label: "Documentation", href: "/help?tab=docs" },
          { icon: MessageCircle, label: "Contact Support", href: "/help?tab=support" },
        ]}
      />

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* FAQ Tab */}
            {tab === "faq" && (
              <>
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button className="pm-card p-5 text-left group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <MessageCircle className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">
                      Contact Support
                    </h3>
                    <p className="text-xs text-gray-500">Get help</p>
                  </div>
                </div>
              </button>

              <button className="pm-card p-5 text-left group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <Sparkles className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">
                      Feature Request
                    </h3>
                    <p className="text-xs text-gray-500">Suggest features</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Search */}
            <div className="pm-card p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pm-input !pl-10 w-full"
                />
              </div>
            </div>

            {/* Documentation Sections */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentationSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Link
                      key={section.id}
                      href="#"
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                          <Icon className="h-5 w-5 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{section.title}</h3>
                          <p className="text-sm text-gray-500">{section.description}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* FAQ */}
            <div className="pm-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
                <div className="flex gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedCategory === category
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
                      }
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <ChevronRight
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          expandedFAQ === faq.id ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="p-4 pt-0 text-sm text-gray-600 border-t border-gray-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Help Overview */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link
                  href="#"
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  Getting Started Guide
                </Link>
                <Link
                  href="#"
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  Video Tutorials
                </Link>
                <Link
                  href="#"
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  API Documentation
                </Link>
                <Link
                  href="#"
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  Changelog
                </Link>
              </div>
            </div>

            {/* Contact Support */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Support</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <a
                    href="mailto:support@example.com"
                    className="text-sm text-gray-900 hover:text-gray-700"
                  >
                    support@example.com
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Response Time</p>
                  <p className="text-sm text-gray-900">Within 24 hours</p>
                </div>
                <button className="w-full pm-button-primary text-sm mt-4">
                  Open Support Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

