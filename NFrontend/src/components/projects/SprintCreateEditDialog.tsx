"use client";
import { useState, useEffect } from "react";
import { Save, X, Calendar, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import sprintService from "@/services/sprintService";
import { Sprint, SprintDTO, SprintStatus } from "@/types/project";
import toast from "react-hot-toast";

interface SprintCreateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  sprint?: Sprint | null; // If provided, edit mode; otherwise, create mode
  onSuccess?: () => void;
}

const SprintCreateEditDialog = ({
  open,
  onOpenChange,
  projectId,
  sprint,
  onSuccess,
}: SprintCreateEditDialogProps) => {
  const isEdit = !!sprint;
  const [formData, setFormData] = useState<Partial<SprintDTO>>({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: SprintStatus.Planning, // Default, but will be auto-detected
    goal: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (sprint) {
        // Edit mode - populate form with sprint data
        const startDate = sprint.start_date.includes("T")
          ? sprint.start_date.split("T")[0]
          : sprint.start_date.split(" ")[0];
        const endDate = sprint.end_date.includes("T")
          ? sprint.end_date.split("T")[0]
          : sprint.end_date.split(" ")[0];

        setFormData({
          name: sprint.name,
          description: sprint.description || "",
          start_date: startDate,
          end_date: endDate,
          status: sprint.status,
          goal: sprint.goal || "",
        });
      } else {
        // Create mode - reset form
        setFormData({
          name: "",
          description: "",
          start_date: "",
          end_date: "",
          status: SprintStatus.Planning, // Will be auto-detected by backend
          goal: "",
        });
      }
    }
  }, [open, sprint]);

  const handleSave = async () => {
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      setSaving(true);

      // Format dates as ISO strings with time (Django expects DateTime)
      // Status will be auto-detected by backend based on dates
      const sprintData: any = {
        name: formData.name || "",
        description: formData.description || "",
        start_date: `${formData.start_date}T00:00:00Z`,
        end_date: `${formData.end_date}T23:59:59Z`,
        goal: formData.goal || "",
        // Don't send status - backend will auto-detect it
      };

      if (isEdit && sprint) {
        await sprintService.updateSprint(projectId, sprint.uuid, sprintData);
        toast.success("Sprint updated successfully");
      } else {
        await sprintService.createSprint(projectId, sprintData);
        toast.success("Sprint created successfully");
      }

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Error saving sprint:", err);
      console.error("Error details:", err.response?.data);
      console.error("Full error:", err);

      const errorData = err.response?.data;
      
      // Handle validation errors (from serializer)
      if (errorData?.details) {
        // Check for field-specific errors
        const fieldErrors: string[] = [];
        
        if (errorData.details.start_date) {
          const startErrors = Array.isArray(errorData.details.start_date) 
            ? errorData.details.start_date 
            : [errorData.details.start_date];
          fieldErrors.push(...startErrors);
        }
        
        if (errorData.details.end_date) {
          const endErrors = Array.isArray(errorData.details.end_date) 
            ? errorData.details.end_date 
            : [errorData.details.end_date];
          fieldErrors.push(...endErrors);
        }
        
        // If we have field errors, show them
        if (fieldErrors.length > 0) {
          toast.error(fieldErrors.join(" "));
        } else {
          // Otherwise, show all details
          const errorMessages = Object.entries(errorData.details)
            .map(([field, errors]: [string, any]) => {
              if (Array.isArray(errors)) {
                return `${field}: ${errors.join(", ")}`;
              }
              return `${field}: ${errors}`;
            })
            .join("\n");
          toast.error(errorMessages || "Validation failed");
        }
      } else if (errorData?.start_date || errorData?.end_date) {
        const errors = [];
        if (errorData.start_date) {
          errors.push(Array.isArray(errorData.start_date) ? errorData.start_date[0] : errorData.start_date);
        }
        if (errorData.end_date) {
          errors.push(Array.isArray(errorData.end_date) ? errorData.end_date[0] : errorData.end_date);
        }
        toast.error(errors.join(" "));
      } else if (errorData?.error) {
        toast.error(errorData.error);
      } else if (errorData?.message) {
        toast.error(errorData.message);
      } else {
        toast.error(isEdit ? "Failed to update sprint" : "Failed to create sprint");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {isEdit ? "Edit Sprint" : "Create Sprint"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update sprint details and settings"
              : "Create a new sprint for this project"}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-6 py-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sprint Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
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
                  value={formData.start_date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
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
                  value={formData.end_date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="pm-input w-full pl-10"
                  required
                />
              </div>
            </div>
          </div>


          {/* Sprint Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sprint Goal
            </label>
            <textarea
              value={formData.goal || ""}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              placeholder="What is the main goal of this sprint?"
              rows={3}
              className="pm-input w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Define the primary objective or outcome for this sprint
            </p>
          </div>
        </div>

        <Separator />

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="pm-button-secondary"
            disabled={saving}
          >
            Cancel
          </button>
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
                {isEdit ? "Save Changes" : "Create Sprint"}
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SprintCreateEditDialog;

