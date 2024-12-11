import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import projectService from "@/services/projectService";
import teamService from "@/services/teamService";
import { Project, ProjectDTO, Team, UpadtedProjectDTO } from "@/types/project";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

interface Props {
  id: string;
}

const ProjectDisplayComponent: React.FC<Props> = ({ id }) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await projectService.getProject(id);
        setProject(response);
      } catch (err: any) {
        toast.error("Something went wrong while fetching the project.");
      }
    };

    const fetchTeams = async () => {
      try {
        const response = await teamService.getTeams();
        setTeams(response);
      } catch (err: any) {
        toast.error("Something went wrong while fetching the teams.");
      }
    };

    fetchProject();
    fetchTeams();
  }, [id]);

  const handleAssignTeam = async () => {
    if (!selectedTeam || !project) {
      toast.error("Please select a team to assign.");
      return;
    }

    try {
      console.log("project id", project.id);

      const response = await projectService.assginTeam({
        project_id: project.id,
        team_id: selectedTeam,
      });
      console.log(response);
      toast.success("Team assigned successfully!");
      setIsDialogOpen(false);
      navigate(0);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to assign the team. Please try again.");
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold">Overview - {project?.name}</h2>
      <div className="mt-4 flex items-center justify-between">
        <p>{project?.description}</p>
        <div className="flex gap-4">
          {!project?.team && (
            <>
              <Button onClick={() => navigate("/teams")}>Create Team</Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Assign Team</Button>
                </DialogTrigger>
                <DialogContent>
                  <h3 className="text-lg font-medium mb-4">Assign a Team</h3>
                  <Select
                    value={selectedTeam?.toString() || ""}
                    onValueChange={(value) => setSelectedTeam(parseInt(value))}
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
                    <Button onClick={handleAssignTeam}>Assign</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
          {project?.team && (
            <Button onClick={() => navigate(`/teams/${project.team.id}`)}>
              View Team
            </Button>
          )}
        </div>
      </div>
      <p className="mt-4">Status: {project?.visibility}</p>
    </>
  );
};

export default ProjectDisplayComponent;
