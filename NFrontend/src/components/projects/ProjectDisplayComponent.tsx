import projectService from "@/services/projectService";
import { Project } from "@/types/project";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
interface Props {
  id: string;
}
const ProjectDisplayComponent: React.FC<Props> = ({ id }) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await projectService.getProject(id);
        setProject(response);
      } catch (err: any) {
        toast.error("Something went wrong");
      }
    };
    fetchProject();
  }, [id]);

  return (
    <>
      <h2 className="text-2xl font-bold">Overview - {project?.name}</h2>
      {/* Description and Buttons in a Row */}
      <div className="mt-4 flex items-center justify-between">
        <p>{project?.description}</p>
        <div className="flex gap-4">
          {/* Buttons based on conditions */}
          {!project?.team && (
            <>
              <Button onClick={() => navigate("/teams")}>Create Team</Button>
              <Button>Assign Team</Button>
            </>
          )}
          {project?.team && (
            <Button onClick={() => navigate(`teams/${project?.team}`)}>
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
