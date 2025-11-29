"use client";
import { useState, useEffect } from "react";
import { Bell, Shield, Palette, Settings, Loader2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/useUser";
import preferencesService, { UserPreferences } from "@/services/preferencesService";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const { user, loading: userLoading } = useUser();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  
  // Fetch preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setPreferencesLoading(true);
        const prefs = await preferencesService.getPreferences();
        setPreferences(prefs);
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
        toast.error("Failed to load preferences");
      } finally {
        setPreferencesLoading(false);
      }
    };
    
    fetchPreferences();
  }, []);
  
  const tabs = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
  ];

  const handleNotificationToggle = async (key: keyof UserPreferences) => {
    if (!preferences) return;
    
    try {
      const updated = await preferencesService.updatePreferences({
        [key]: !preferences[key],
      });
      setPreferences(updated);
      toast.success("Notification preference updated");
    } catch (error) {
      console.error("Failed to update preference:", error);
      toast.error("Failed to update preference");
    }
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    if (!preferences) return;
    
    try {
      const updated = await preferencesService.updatePreferences({ theme });
      setPreferences(updated);
      toast.success("Theme updated");
    } catch (error) {
      console.error("Failed to update theme:", error);
      toast.error("Failed to update theme");
    }
  };

  if (userLoading || preferencesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Settings"
          description="Manage your account settings and preferences"
          icon={Settings}
          showTabs={false}
        />
        <div className="px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                            ? "bg-orange-600 text-white"
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
              {/* Notifications Tab */}
              {activeTab === "notifications" && preferences && (
                <div className="pm-card p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Notification Preferences
                    </h2>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      {[
                        {
                          key: "email_notifications" as keyof UserPreferences,
                          label: "Email notifications",
                          description:
                            "Receive email updates about your projects and tasks",
                        },
                        {
                          key: "task_assignments" as keyof UserPreferences,
                          label: "Task assignments",
                          description:
                            "Get notified when tasks are assigned to you",
                        },
                        {
                          key: "project_updates" as keyof UserPreferences,
                          label: "Project updates",
                          description:
                            "Receive updates when projects you're part of change",
                        },
                        {
                          key: "deadline_reminders" as keyof UserPreferences,
                          label: "Deadline reminders",
                          description: "Get reminders before task deadlines",
                        },
                        {
                          key: "team_mentions" as keyof UserPreferences,
                          label: "Team mentions",
                          description:
                            "Notify me when I'm mentioned in comments",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
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
                              checked={preferences[item.key] as boolean}
                              onChange={() => handleNotificationToggle(item.key)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === "appearance" && preferences && (
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
                          {[
                            { value: 'light' as const, label: 'Light' },
                            { value: 'dark' as const, label: 'Dark' },
                            { value: 'system' as const, label: 'System' }
                          ].map((theme) => (
                            <button
                              key={theme.value}
                              onClick={() => handleThemeChange(theme.value)}
                              className={`p-4 border-2 rounded-lg transition-all text-center ${
                                preferences.theme === theme.value
                                  ? "border-orange-600 bg-orange-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <p className="font-medium text-gray-900">
                                {theme.label}
                              </p>
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Choose how Agile Bot looks to you
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
