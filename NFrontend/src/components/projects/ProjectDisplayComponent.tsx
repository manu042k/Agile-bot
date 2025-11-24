"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import teamService from "@/services/teamService";
import { Team } from "@/types/project";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import ProjectOverviewComponent from "./ProjectOverviewComponent";
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
import { useProject } from "@/hooks/useProjects";
import { LoadingSpinner } from "../common/Loading";
import projectService from "@/services/projectService";

interface Props {
  id: string;
}

const ProjectDisplayComponent: React.FC<Props> = ({ id }) => {
  const router = useRouter();
  const { project, loading: projectLoading, setProject } = useProject(id);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isOverviewDialogOpen, setIsOverviewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await teamService.getTeams();
        setTeams(response);
      } catch (err) {
        toast.error("Failed to fetch teams. Please try again.");
      }
    };

    fetchTeams();
  }, []);

  const handleFileChange = () => {
    setIsOverviewDialogOpen(false);
    router.refresh(); // Refresh the page
  };

  const handleAssignTeam = async () => {
    if (!selectedTeam || !project) {
      toast.error("Please select a team to assign.");
      return;
    }

    try {
      setIsLoading(true);
      await projectService.assginTeam({
        project_id: project.id,
        team_id: selectedTeam,
      });
      toast.success("Team assigned successfully!");
      setIsAssignDialogOpen(false);
      router.refresh();
    } catch (err) {
      toast.error("Failed to assign the team. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteProject = async () => {
    try {
      if (!project) {
        return;
      }
      await projectService.deleteProject(project.id.toString());
      router.push("/projects");
      toast.success("Project deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete the project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Project Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {project.name}
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              {project.visibility}
            </span>
          </div>
          <p className="text-muted-foreground text-lg">{project.description}</p>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Upload Document Card */}
        <Dialog
          open={isOverviewDialogOpen}
          onOpenChange={setIsOverviewDialogOpen}
        >
          <DialogTrigger asChild>
            <button className="crm-card crm-card-hover p-4 text-left group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm">Upload Document</p>
                  <p className="text-xs text-muted-foreground">Requirements</p>
                </div>
              </div>
            </button>
          </DialogTrigger>
          <DialogContent>
            <ProjectOverviewComponent onSuccess={handleFileChange} />
          </DialogContent>
        </Dialog>

        {/* Team Management Card */}
        {!project?.team ? (
          <>
            <button
              onClick={() => router.push("/teams")}
              className="crm-card crm-card-hover p-4 text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm">Create Team</p>
                  <p className="text-xs text-muted-foreground">New team</p>
                </div>
              </div>
            </button>

            <Dialog
              open={isAssignDialogOpen}
              onOpenChange={setIsAssignDialogOpen}
            >
              <DialogTrigger asChild>
                <button className="crm-card crm-card-hover p-4 text-left group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Assign Team</p>
                      <p className="text-xs text-muted-foreground">
                        Select team
                      </p>
                    </div>
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent>
                <h3 className="text-lg font-semibold mb-4">Assign a Team</h3>
                <Select
                  value={selectedTeam?.toString() || ""}
                  onValueChange={(value) =>
                    setSelectedTeam(parseInt(value, 10))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-end mt-4">
                  <Button onClick={handleAssignTeam} disabled={isLoading}>
                    {isLoading ? "Assigning..." : "Assign"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <button
            onClick={() => router.push(`/team/${project.team.id}`)}
            className="crm-card crm-card-hover p-4 text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm">View Team</p>
                <p className="text-xs text-muted-foreground">
                  {project.team.name}
                </p>
              </div>
            </div>
          </button>
        )}

        {/* Delete Project Card */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="crm-card hover:border-destructive/50 hover:shadow-lg transition-all duration-300 p-4 text-left group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                  <svg
                    className="w-5 h-5 text-destructive"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-destructive">
                    Delete Project
                  </p>
                  <p className="text-xs text-muted-foreground">Permanent</p>
                </div>
              </div>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                project and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProject}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ProjectDisplayComponent;
