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
    <div className="space-y-6">
      {/* Professional Project Header */}
      <div className="bg-white border-b-2 border-gray-200 pb-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-4xl font-bold text-gray-900">
                {project.name}
              </h1>
              <span className="inline-flex items-center px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide bg-gray-100 text-gray-700 border border-gray-300">
                {project.visibility}
              </span>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">{project.description}</p>
          </div>
        </div>
      </div>

      {/* Professional Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Upload Document Card */}
        <Dialog
          open={isOverviewDialogOpen}
          onOpenChange={setIsOverviewDialogOpen}
        >
          <DialogTrigger asChild>
            <button className="bg-white border-2 border-gray-200 rounded-lg p-5 text-left group hover:border-gray-900 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-black transition-colors">
                  <svg className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-base text-gray-900 mb-1">Upload Document</p>
                  <p className="text-xs text-gray-600 font-medium">Requirements</p>
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
              className="bg-white border-2 border-gray-200 rounded-lg p-5 text-left group hover:border-gray-900 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-black transition-colors">
                  <svg className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-base text-gray-900 mb-1">Create Team</p>
                  <p className="text-xs text-gray-600 font-medium">New team</p>
                </div>
              </div>
            </button>

            <Dialog
              open={isAssignDialogOpen}
              onOpenChange={setIsAssignDialogOpen}
            >
              <DialogTrigger asChild>
                <button className="bg-white border-2 border-gray-200 rounded-lg p-5 text-left group hover:border-gray-900 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-black transition-colors">
                      <svg className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-base text-gray-900 mb-1">Assign Team</p>
                      <p className="text-xs text-gray-600 font-medium">Select team</p>
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
            className="bg-white border-2 border-gray-200 rounded-lg p-5 text-left group hover:border-gray-900 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-black transition-colors">
                <svg className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-base text-gray-900 mb-1">View Team</p>
                <p className="text-xs text-gray-600 font-medium">{project.team.name}</p>
              </div>
            </div>
          </button>
        )}

        {/* Delete Project Card */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="bg-white border-2 border-gray-200 rounded-lg p-5 text-left group hover:border-red-600 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                  <svg className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-base text-red-600 mb-1">Delete Project</p>
                  <p className="text-xs text-gray-600 font-medium">Permanent</p>
                </div>
              </div>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete
                your project and remove your data from our servers.
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
