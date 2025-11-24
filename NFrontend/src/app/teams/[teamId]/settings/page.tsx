"use client";
import { useParams, usePathname } from "next/navigation";
import {
  Users,
  FolderKanban,
  Settings,
  Save,
  Trash2,
  AlertTriangle,
  Globe,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock team data
const getMockTeam = (teamId: string) => ({
  id: teamId,
  name: "Development Team",
  description: "Responsible for developing and maintaining the application",
  visibility: "public",
  created: "2024-01-10",
});

const TeamSettingsPage = () => {
  const params = useParams();
  const pathname = usePathname();
  const teamId = params.teamId as string;
  const [team, setTeam] = useState(getMockTeam(teamId));
  const [isSaving, setIsSaving] = useState(false);

  const navItems = [
    { icon: Users, label: "Overview", href: `/teams/${teamId}` },
    { icon: Users, label: "Members", href: `/teams/${teamId}/members` },
    {
      icon: FolderKanban,
      label: "Projects",
      href: `/teams/${teamId}/projects`,
    },
    { icon: Settings, label: "Settings", href: `/teams/${teamId}/settings` },
  ].map((item) => ({
    ...item,
    active:
      pathname === item.href ||
      (item.href === `/teams/${teamId}` && pathname === `/teams/${teamId}`),
  }));

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Team Header with Tabs */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                {team.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {team.name}
              </h1>
              <p className="text-gray-600 leading-relaxed">
                {team.description}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    item.active
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Team Settings
            </h2>
            <p className="text-gray-600">
              Manage team configuration and preferences
            </p>
          </div>

          {/* General Settings */}
          <div className="pm-card p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              General Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={team.name}
                  onChange={(e) => setTeam({ ...team, name: e.target.value })}
                  className="pm-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={team.description}
                  onChange={(e) =>
                    setTeam({ ...team, description: e.target.value })
                  }
                  rows={4}
                  className="pm-input w-full"
                />
              </div>
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="pm-card p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Visibility
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={team.visibility === "public"}
                  onChange={(e) =>
                    setTeam({ ...team, visibility: e.target.value })
                  }
                  className="w-4 h-4 text-gray-900"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Public</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Anyone in your workspace can view this team
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={team.visibility === "private"}
                  onChange={(e) =>
                    setTeam({ ...team, visibility: e.target.value })
                  }
                  className="w-4 h-4 text-gray-900"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Private</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Only team members can view this team
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pm-card p-6 border-2 border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-700" />
              Danger Zone
            </h3>
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <p className="font-medium text-gray-900">Delete Team</p>
                <p className="text-sm text-gray-500 mt-1">
                  Permanently delete this team and all its data. This action
                  cannot be undone.
                </p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                <Trash2 className="h-4 w-4 mr-2 inline" />
                Delete
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button className="pm-button-secondary">Cancel</button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="pm-button-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSettingsPage;
