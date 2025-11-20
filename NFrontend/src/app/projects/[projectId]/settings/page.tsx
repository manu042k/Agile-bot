"use client";
import { useParams } from "next/navigation";
import { Save, Trash2, Archive, Globe, Lock, Users, AlertTriangle } from "lucide-react";
import { useState } from "react";
import ProjectHeader from "@/components/projects/ProjectHeader";

// Mock project settings
const getMockProject = (projectId: string) => ({
  id: projectId,
  name: "E-Commerce Platform",
  description: "Build a modern e-commerce platform with React and Node.js. Includes user authentication, product catalog, shopping cart, and payment integration.",
  status: "active",
  visibility: "public",
  team: "Development Team",
  created: "2024-01-15",
  deadline: "2024-06-30",
});

const ProjectSettingsPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState(getMockProject(projectId));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Show success message
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader />
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage project configuration and preferences</p>
        </div>

        <div className="max-w-4xl space-y-6">
          {/* General Settings */}
          <div className="pm-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">General Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => setProject({ ...project, name: e.target.value })}
                  className="pm-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={project.description}
                  onChange={(e) => setProject({ ...project, description: e.target.value })}
                  rows={4}
                  className="pm-input w-full"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={project.status}
                    onChange={(e) => setProject({ ...project, status: e.target.value })}
                    className="pm-input w-full"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                  <input
                    type="date"
                    value={project.deadline}
                    onChange={(e) => setProject({ ...project, deadline: e.target.value })}
                    className="pm-input w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="pm-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Visibility</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={project.visibility === "public"}
                  onChange={(e) => setProject({ ...project, visibility: e.target.value })}
                  className="w-4 h-4 text-gray-900"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Public</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Anyone in your workspace can view this project</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={project.visibility === "private"}
                  onChange={(e) => setProject({ ...project, visibility: e.target.value })}
                  className="w-4 h-4 text-gray-900"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Private</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Only team members can view this project</p>
                </div>
              </label>
            </div>
          </div>

          {/* Team Settings */}
          <div className="pm-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Team</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{project.team}</p>
                    <p className="text-sm text-gray-500">5 members</p>
                  </div>
                </div>
                <button className="pm-button-secondary text-sm">
                  Manage Team
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pm-card p-6 border-2 border-gray-300">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-700" />
              Danger Zone
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Archive Project</p>
                  <p className="text-sm text-gray-500 mt-1">Archive this project. It will be hidden from active projects.</p>
                </div>
                <button className="pm-button-secondary text-sm">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </button>
              </div>
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <p className="font-medium text-gray-900">Delete Project</p>
                  <p className="text-sm text-gray-500 mt-1">Permanently delete this project and all its data. This action cannot be undone.</p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                  <Trash2 className="h-4 w-4 mr-2 inline" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3">
            <button className="pm-button-secondary">
              Cancel
            </button>
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

export default ProjectSettingsPage;

