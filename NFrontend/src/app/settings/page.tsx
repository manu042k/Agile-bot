"use client";
import { useState } from "react";
import { Bell, Shield, Palette, Globe, Settings } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Separator } from "@/components/ui/separator";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("notifications");

  const tabs = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "general", label: "General", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
        icon={Settings}
        showTabs={false}
      />
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="pm-card p-2">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          activeTab === tab.id
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeTab === "notifications" && (
                <div className="pm-card p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Notification Preferences
                    </h2>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      {[
                        {
                          label: "Email notifications",
                          description:
                            "Receive email updates about your projects and tasks",
                        },
                        {
                          label: "Task assignments",
                          description:
                            "Get notified when tasks are assigned to you",
                        },
                        {
                          label: "Project updates",
                          description:
                            "Receive updates when projects you're part of change",
                        },
                        {
                          label: "Deadline reminders",
                          description: "Get reminders before task deadlines",
                        },
                        {
                          label: "Team mentions",
                          description:
                            "Notify me when I'm mentioned in comments",
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.label}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {item.description}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              defaultChecked={idx < 3}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="pm-card p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Security Settings
                    </h2>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">
                          Password Management
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Your account is managed by Google. Password changes
                          and two-factor authentication are handled through your
                          Google Account.
                        </p>
                        <a
                          href="https://myaccount.google.com/security"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1"
                        >
                          Manage Google Account Security
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">
                          Active Sessions
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          View and manage your active sessions across all
                          devices.
                        </p>
                        <a
                          href="https://myaccount.google.com/device-activity"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1"
                        >
                          View Device Activity
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="pm-card p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Appearance
                    </h2>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Theme
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {["Light", "Dark", "System"].map((theme) => (
                            <button
                              key={theme}
                              className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all text-center"
                            >
                              <p className="font-medium text-gray-900">
                                {theme}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "general" && (
                <div className="pm-card p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      General Settings
                    </h2>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select className="pm-input w-full">
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time Zone
                        </label>
                        <select className="pm-input w-full">
                          <option>UTC-5 (Eastern Time)</option>
                          <option>UTC-8 (Pacific Time)</option>
                          <option>UTC+0 (GMT)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Format
                        </label>
                        <select className="pm-input w-full">
                          <option>MM/DD/YYYY</option>
                          <option>DD/MM/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button className="pm-button-primary">Save Changes</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
