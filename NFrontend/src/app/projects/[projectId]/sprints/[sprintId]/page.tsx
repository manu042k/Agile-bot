"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Save, X, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import ProjectHeader from "@/components/projects/ProjectHeader";
import { Separator } from "@/components/ui/separator";
import sprintService from "@/services/sprintService";
import { Sprint, SprintDTO, SprintStatus } from "@/types/project";
import toast from "react-hot-toast";

const SprintEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const sprintId = params.sprintId as string;
  const isNew = sprintId === "new";

  const [sprint, setSprint] = useState<Partial<SprintDTO>>({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: SprintStatus.Planning,
    goal: "",
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew) {
      fetchSprint();
    }
  }, [projectId, sprintId, isNew]);

  const fetchSprint = async () => {
    try {
      setLoading(true);
      const data = await sprintService.getSprint(projectId, sprintId);
      // Extract date part from ISO datetime string
      const startDate = data.start_date.includes("T") 
        ? data.start_date.split("T")[0] 
        : data.start_date.split(" ")[0];
      const endDate = data.end_date.includes("T")
        ? data.end_date.split("T")[0]
        : data.end_date.split(" ")[0];
      
      setSprint({
        name: data.name,
        description: data.description,
        start_date: startDate,
        end_date: endDate,
        status: data.status,
        goal: data.goal,
      });
      setError(null);
    } catch (err: any) {
      console.error("Error fetching sprint:", err);
      setError(err.message || "Failed to fetch sprint");
      toast.error("Failed to load sprint");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!sprint.name || !sprint.start_date || !sprint.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);

    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      setSaving(true);
      
      // Format dates as ISO strings with time (Django expects DateTime)
      const sprintData: SprintDTO = {
        name: sprint.name || "",
        description: sprint.description || "",
        start_date: `${sprint.start_date}T00:00:00Z`, // Add time to make it DateTime
        end_date: `${sprint.end_date}T23:59:59Z`, // End of day
        status: sprint.status || SprintStatus.Planning,
        goal: sprint.goal || "",
      };

      if (isNew) {
        await sprintService.createSprint(projectId, sprintData);
        toast.success("Sprint created successfully");
      } else {
        await sprintService.updateSprint(projectId, sprintId, sprintData);
        toast.success("Sprint updated successfully");
      }
      router.push(`/projects/${projectId}/timeline`);
    } catch (err: any) {
      console.error("Error saving sprint:", err);
      console.error("Error details:", err.response?.data);
      
      // Show detailed error messages
      const errorData = err.response?.data;
      if (errorData?.details) {
        // Django validation errors
        const errorMessages = Object.entries(errorData.details)
          .map(([field, errors]: [string, any]) => {
            if (Array.isArray(errors)) {
              return `${field}: ${errors.join(", ")}`;
            }
            return `${field}: ${errors}`;
          })
          .join("\n");
        toast.error(errorMessages || "Validation failed");
      } else if (errorData?.error) {
        toast.error(errorData.error);
      } else if (errorData?.message) {
        toast.error(errorData.message);
      } else {
        toast.error(isNew ? "Failed to create sprint" : "Failed to update sprint");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading sprint...</p>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                {isNew ? "Create Sprint" : "Edit Sprint"}
              </h1>
              <p className="text-gray-600">
                {isNew ? "Create a new sprint for this project" : "Update sprint details"}
              </p>
            </div>
            <Link
              href={`/projects/${projectId}/sprints`}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Back to Sprints"
            >
              <X className="h-5 w-5 text-gray-600" />
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="pm-card p-6 max-w-3xl">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sprint Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sprint.name || ""}
                onChange={(e) => setSprint({ ...sprint, name: e.target.value })}
                placeholder="e.g., Sprint 1, Q1 Sprint, Feature Sprint"
                className="pm-input w-full"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={sprint.description || ""}
                onChange={(e) => setSprint({ ...sprint, description: e.target.value })}
                placeholder="Brief description of this sprint"
                rows={3}
                className="pm-input w-full"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={sprint.start_date || ""}
                    onChange={(e) => setSprint({ ...sprint, start_date: e.target.value })}
                    className="pm-input w-full pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={sprint.end_date || ""}
                    onChange={(e) => setSprint({ ...sprint, end_date: e.target.value })}
                    className="pm-input w-full pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={sprint.status || SprintStatus.Planning}
                onChange={(e) => setSprint({ ...sprint, status: e.target.value as SprintStatus })}
                className="pm-input w-full"
              >
                <option value={SprintStatus.Planning}>Planning</option>
                <option value={SprintStatus.Active}>Active</option>
                <option value={SprintStatus.Completed}>Completed</option>
                <option value={SprintStatus.Cancelled}>Cancelled</option>
              </select>
            </div>

            {/* Sprint Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sprint Goal
              </label>
              <textarea
                value={sprint.goal || ""}
                onChange={(e) => setSprint({ ...sprint, goal: e.target.value })}
                placeholder="What is the main goal of this sprint?"
                rows={3}
                className="pm-input w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Define the primary objective or outcome for this sprint
              </p>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Link
                href={`/projects/${projectId}/sprints`}
                className="pm-button-secondary"
              >
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="pm-button-primary"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isNew ? "Create Sprint" : "Save Changes"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SprintEditPage;

