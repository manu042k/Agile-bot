"use client";
import { useParams, useRouter } from "next/navigation";
import { Save, Trash2, Archive, Globe, Lock, Users, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import ProjectHeader from "@/components/projects/ProjectHeader";
import { Separator } from "@/components/ui/separator";
import projectService from "@/services/projectService";
import { Project, ProjectVisibility } from "@/types/project";
import toast from "react-hot-toast";

const ProjectSettingsPage = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const projectData = await projectService.getProject(projectId);
        setProject(projectData);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching project:", err);
        setError(err.message || "Failed to fetch project");
        toast.error("Failed to load project settings");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSave = async () => {
    if (!project || !project.team) {
      toast.error("Project must have a team assigned");
      return;
    }

    try {
      setIsSaving(true);
      await projectService.updateProject({
        id: project.id.toString(),
        name: project.name,
        description: project.description,
        visibility: project.visibility,
        team: project.team.id.toString(),
      });
      toast.success("Project settings updated successfully");
    } catch (err: any) {
      console.error("Error updating project:", err);
      toast.error(err.response?.data?.error || "Failed to update project settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    );
    
    if (!confirmed) return;

    try {
      await projectService.deleteProject(project.id.toString());
      toast.success("Project deleted successfully");
      router.push("/projects");
    } catch (err: any) {
      console.error("Error deleting project:", err);
      toast.error(err.response?.data?.error || "Failed to delete project");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="px-6 py-8">
          <div className="pm-card p-8 text-center border-red-200 bg-red-50">
            <p className="text-red-600 font-medium mb-2">Failed to load settings</p>
            <p className="text-sm text-red-500">{error || "Project not found"}</p>
          </div>
        </div>
      </div>
    );
  }

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
            <h2 className="text-lg font-semibold text-gray-900">General Information</h2>
            <Separator className="my-4" />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                <input
                  type="text"
                  value={new Date(project.created_at).toLocaleDateString()}
                  disabled
                  className="pm-input w-full bg-gray-50 text-gray-500"
                />
              </div>
              
              {/* Save Button */}
              <div className="flex items-center justify-end gap-3 pt-4">
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

          {/* Visibility Settings */}
          <div className="pm-card p-6">
            <h2 className="text-lg font-semibold text-gray-900">Visibility</h2>
            <Separator className="my-4" />
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value={ProjectVisibility.PUBLIC}
                  checked={project.visibility === ProjectVisibility.PUBLIC}
                  onChange={(e) => setProject({ ...project, visibility: e.target.value as ProjectVisibility })}
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
                  value={ProjectVisibility.PRIVATE}
                  checked={project.visibility === ProjectVisibility.PRIVATE}
                  onChange={(e) => setProject({ ...project, visibility: e.target.value as ProjectVisibility })}
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
            <h2 className="text-lg font-semibold text-gray-900">Team</h2>
            <Separator className="my-4" />
            <div className="space-y-3">
              {project.team ? (
                <div className={`flex items-center justify-between p-4 border rounded-lg ${
                  project.team.is_archived 
                    ? 'border-orange-200 bg-orange-50' 
                    : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 flex-1">
                    <Users className={`h-5 w-5 ${project.team.is_archived ? 'text-orange-600' : 'text-gray-600'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{project.team.name}</p>
                        {project.team.is_archived && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700 border border-orange-300 flex items-center gap-1">
                            <Archive className="h-3 w-3" />
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{project.team.members?.length || 0} members</p>
                      {project.team.is_archived && (
                        <p className="text-xs text-orange-600 mt-1">
                          This team has been archived. Team management is disabled.
                        </p>
                      )}
                    </div>
                  </div>
                  {!project.team.is_archived && (
                    <button 
                      onClick={() => router.push(`/projects/${projectId}/team`)}
                      className="pm-button-secondary text-sm"
                    >
                      Manage Team
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
                  <p className="text-gray-600 text-sm">No team assigned to this project</p>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pm-card p-6 border-2 border-gray-300">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-700" />
              Danger Zone
            </h2>
            <Separator className="my-4" />
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
                <button 
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <Trash2 className="h-4 w-4 mr-2 inline" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsPage;

