"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, Calendar, Clock, CheckCircle2, PlayCircle, ListTodo, Edit, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import ProjectHeader from "@/components/projects/ProjectHeader";
import { Separator } from "@/components/ui/separator";
import SprintCreateEditDialog from "@/components/projects/SprintCreateEditDialog";
import sprintService from "@/services/sprintService";
import { Sprint, SprintStatus } from "@/types/project";
import toast from "react-hot-toast";
import DeleteConfirmationDialog from "@/components/common/DeleteConfirmationDialog";
import CreateCard from "@/components/common/CreateCard";

const SprintsPage = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

  useEffect(() => {
    fetchSprints();
  }, [projectId]);

  const fetchSprints = async () => {
    try {
      setLoading(true);
      const data = await sprintService.getSprints(projectId);
      setSprints(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching sprints:", err);
      setError(err.message || "Failed to fetch sprints");
      toast.error("Failed to load sprints");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!sprintToDelete) return;

    try {
      setIsDeleting(true);
      await sprintService.deleteSprint(projectId, sprintToDelete.id.toString());
      toast.success("Sprint deleted successfully");
      setDeleteDialogOpen(false);
      setSprintToDelete(null);
      fetchSprints();
    } catch (err: any) {
      console.error("Error deleting sprint:", err);
      toast.error("Failed to delete sprint");
    } finally {
      setIsDeleting(false);
    }
  };

  const getEffectiveStatus = (sprint: Sprint): SprintStatus => {
    // Use auto_status if available, otherwise use status
    return sprint.auto_status || sprint.status;
  };

  const getStatusColor = (status: SprintStatus) => {
    switch (status) {
      case SprintStatus.Active:
        return "bg-orange-100 text-orange-800 border-orange-300";
      case SprintStatus.Completed:
        return "bg-gray-800 text-white border-gray-800";
      case SprintStatus.Planning:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case SprintStatus.Cancelled:
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: SprintStatus) => {
    switch (status) {
      case SprintStatus.Active:
        return <PlayCircle className="h-4 w-4" />;
      case SprintStatus.Completed:
        return <CheckCircle2 className="h-4 w-4" />;
      case SprintStatus.Planning:
        return <ListTodo className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading sprints...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="px-6 py-8">
          <div className="pm-card p-8 text-center border-red-200 bg-red-50">
            <p className="text-red-600 font-medium mb-2">Failed to load sprints</p>
            <p className="text-sm text-red-500">{error}</p>
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
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Sprints</h1>
              <p className="text-gray-600">Manage sprints and track iterations</p>
            </div>
            <CreateCard
              title="New Sprint"
              description="Create sprint"
              icon={Plus}
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-auto"
            />
          </div>
        </div>

        {/* Sprints List */}
        {sprints.length > 0 ? (
          <div className="space-y-4">
            {sprints.map((sprint) => {
              const completionRate = sprint.task_count && sprint.task_count > 0
                ? Math.round((sprint.completed_task_count || 0) / sprint.task_count * 100)
                : 0;
              
              const effectiveStatus = getEffectiveStatus(sprint);

              return (
                <div key={sprint.id} className="pm-card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{sprint.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(effectiveStatus)}`}>
                          {getStatusIcon(effectiveStatus)}
                          {effectiveStatus}
                        </span>
                      </div>
                      
                      {sprint.description && (
                        <p className="text-sm text-gray-600 mb-3">{sprint.description}</p>
                      )}
                      
                      {sprint.goal && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Sprint Goal</p>
                          <p className="text-sm text-gray-700">{sprint.goal}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {getDuration(sprint.start_date, sprint.end_date)} days
                        </span>
                        <span>
                          {sprint.completed_task_count || 0} / {sprint.task_count || 0} tasks completed
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Progress</span>
                          <span className="text-xs font-medium text-gray-900">{completionRate}%</span>
                        </div>
                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-600 rounded-full transition-all"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setEditingSprint(sprint)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Edit Sprint"
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          setSprintToDelete(sprint);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Sprint"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="pm-card p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">No sprints yet</p>
            <p className="text-sm text-gray-500 mb-6">Create your first sprint to get started</p>
            <div className="flex justify-center">
              <CreateCard
                title="Create Sprint"
                description="New sprint"
                icon={Plus}
              onClick={() => setIsCreateDialogOpen(true)}
              />
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Sprint"
        description={`Are you sure you want to delete "${sprintToDelete?.name}"? This will remove the sprint and unassign all tasks from it. This action cannot be undone.`}
        itemName={sprintToDelete?.name || ""}
        confirmLabel="Delete Sprint"
        cancelLabel="Cancel"
      />

      {/* Create Sprint Dialog */}
      <SprintCreateEditDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectId={projectId}
        onSuccess={fetchSprints}
      />

      {/* Edit Sprint Dialog */}
      <SprintCreateEditDialog
        open={!!editingSprint}
        onOpenChange={(open) => {
          if (!open) setEditingSprint(null);
        }}
        projectId={projectId}
        sprint={editingSprint}
        onSuccess={() => {
          setEditingSprint(null);
          fetchSprints();
        }}
      />
    </div>
  );
};

export default SprintsPage;

