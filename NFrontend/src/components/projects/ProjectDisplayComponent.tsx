import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import projectService from "@/services/projectService";
import teamService from "@/services/teamService";
import { Project, Team } from "@/types/project";
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

interface Props {
  id: string;
}

const ProjectDisplayComponent: React.FC<Props> = ({ id }) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isOverviewDialogOpen, setIsOverviewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await projectService.getProject(id);
        setProject(response);
      } catch (err) {
        toast.error("Failed to fetch the project. Please try again.");
      }
    };

    const fetchTeams = async () => {
      try {
        const response = await teamService.getTeams();
        setTeams(response);
      } catch (err) {
        toast.error("Failed to fetch teams. Please try again.");
      }
    };

    fetchProject();
    fetchTeams();
  }, [id]);

  const handleFileChange = () => {
    setIsOverviewDialogOpen(false);
    navigate(0); // Refresh the page
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
      navigate(0);
    } catch (err) {
      toast.error("Failed to assign the team. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <div className="bg-white p-6 shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Overview - {project?.name}</h2>
        <p className="text-gray-600">{project?.description}</p>
        <p className="mt-4 text-gray-800 font-medium">
          <span className="font-bold">Status:</span> {project?.visibility}
        </p>
      </div>

      {/* Actions Section */}
      <div className="bg-white p-6 shadow-md rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Actions</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Upload Requirement Document */}
          <Dialog
            open={isOverviewDialogOpen}
            onOpenChange={setIsOverviewDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>Upload Requirement Document</Button>
            </DialogTrigger>
            <DialogContent>
              <ProjectOverviewComponent onSuccess={handleFileChange} />
            </DialogContent>
          </Dialog>

          {/* Team Management */}
          {!project?.team ? (
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Create Team */}
              <Button onClick={() => navigate("/teams")}>Create Team</Button>

              {/* Assign Team */}
              <Dialog
                open={isAssignDialogOpen}
                onOpenChange={setIsAssignDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>Assign Team</Button>
                </DialogTrigger>
                <DialogContent>
                  <h3 className="text-lg font-medium mb-4">Assign a Team</h3>
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
            </div>
          ) : (
            <Button onClick={() => navigate(`/teams/${project.team.id}`)}>
              View Team
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDisplayComponent;
