"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Users,
  FolderKanban,
  Settings,
  Save,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import teamService from "@/services/teamService";
import { Team } from "@/types/project";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/common/PageHeader";

const TeamSettingsPage = () => {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const teamId = params.teamId as string;
  const [team, setTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch team data
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        setError(null);
        const teamData = await teamService.getTeam(teamId);
        setTeam(teamData);
        setFormData({
          name: teamData.name,
          description: teamData.description || "",
        });
      } catch (err: any) {
        console.error("Failed to fetch team:", err);
        setError(err.message || "Failed to load team");
        toast.error("Failed to load team. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchTeam();
    }
  }, [teamId]);

  const handleSave = async () => {
    if (!team) return;

    try {
      setIsSaving(true);
      await teamService.updateTeam({
        ...team,
        name: formData.name,
        description: formData.description,
      });
      toast.success("Team updated successfully!");
      // Refresh team data
      const updatedTeam = await teamService.getTeam(teamId);
      setTeam(updatedTeam);
    } catch (err: any) {
      console.error("Failed to update team:", err);
      toast.error(err.message || "Failed to update team. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!team) return;

    try {
      setIsDeleting(true);
      await teamService.deleteTeam(teamId);
      toast.success("Team deleted successfully!");
      router.push("/teams");
    } catch (err: any) {
      console.error("Failed to delete team:", err);
      toast.error(err.message || "Failed to delete team. Please try again.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading team settings...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="pm-card p-6 text-center max-w-md">
          <p className="text-red-600 mb-4">{error || "Team not found"}</p>
          <Link href="/teams" className="pm-button-primary inline-flex items-center gap-2">
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={team.name}
        description={team.description || "No description"}
        icon={Users}
        tabs={[
          { icon: Users, label: "Overview", href: `/teams/${teamId}` },
          { icon: Users, label: "Members", href: `/teams/${teamId}/members` },
          { icon: FolderKanban, label: "Projects", href: `/teams/${teamId}/projects` },
          { icon: Settings, label: "Settings", href: `/teams/${teamId}/settings` },
        ]}
      />

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mt-6">

          {/* General Settings */}
          <div className="pm-card p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              General Information
            </h3>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pm-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="pm-input w-full"
                />
              </div>
            </div>
            
            {/* Save and Cancel Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <Link href={`/teams/${teamId}`} className="pm-button-secondary">
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={isSaving || (formData.name === team.name && formData.description === (team.description || ""))}
                className="pm-button-primary inline-flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>


          {/* Danger Zone */}
          <div className="pm-card p-6 border-2 border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-700" />
              Danger Zone
            </h3>
            <Separator className="my-4" />
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <p className="font-medium text-gray-900">Delete Team</p>
                <p className="text-sm text-gray-500 mt-1">
                  Permanently delete this team and all its data. This action
                  cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the team
                      &quot;{team.name}&quot; and remove all associated data from our servers.
                      All team members will lose access to this team and its projects.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Team"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSettingsPage;
