"use client";
import { useState } from "react";
import { User, Bell, Shield, Palette, Globe, Save } from "lucide-react";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "general", label: "General", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

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
              {activeTab === "profile" && (
                <div className="pm-card p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input type="text" className="pm-input w-full" defaultValue="John" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input type="text" className="pm-input w-full" defaultValue="Doe" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" className="pm-input w-full" defaultValue="john.doe@example.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input type="tel" className="pm-input w-full" defaultValue="+1 (555) 123-4567" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <textarea className="pm-input w-full h-24" defaultValue="Project Manager with 5+ years of experience" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button className="pm-button-primary">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="pm-card p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                    <div className="space-y-4">
                      {[
                        { label: "Email notifications", description: "Receive email updates about your projects and tasks" },
                        { label: "Task assignments", description: "Get notified when tasks are assigned to you" },
                        { label: "Project updates", description: "Receive updates when projects you're part of change" },
                        { label: "Deadline reminders", description: "Get reminders before task deadlines" },
                        { label: "Team mentions", description: "Notify me when I'm mentioned in comments" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={idx < 3} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-900/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
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
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input type="password" className="pm-input w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input type="password" className="pm-input w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input type="password" className="pm-input w-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button className="pm-button-primary">Update Password</button>
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="pm-card p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                        <div className="grid grid-cols-3 gap-3">
                          {["Light", "Dark", "System"].map((theme) => (
                            <button
                              key={theme}
                              className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all text-center"
                            >
                              <p className="font-medium text-gray-900">{theme}</p>
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
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select className="pm-input w-full">
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                        <select className="pm-input w-full">
                          <option>UTC-5 (Eastern Time)</option>
                          <option>UTC-8 (Pacific Time)</option>
                          <option>UTC+0 (GMT)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                        <select className="pm-input w-full">
                          <option>MM/DD/YYYY</option>
                          <option>DD/MM/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button className="pm-button-primary">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
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
