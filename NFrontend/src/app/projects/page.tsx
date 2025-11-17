"use client";
import { CirclePlus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Project } from "@/types/project";
import projectService from "@/services/projectService";
import toast from "react-hot-toast";
import CreateProjectComponent from "@/components/projects/CreateProjectComponent";
import ProjectCardComponent from "@/components/projects/ProjectCardComponent";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getProjects();
        setProjects(response);
      } catch (err: any) {
        console.log(err);
        toast.error("Failed to fetch projects. Please try again.");
      }
    };

    fetchProjects();
  }, []);

  return (
    <>
      <div className="flex h-screen">
        <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-visible">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Projects</h1>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Dialog>
              <DialogTrigger>
                <div className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center hover:bg-gray-100">
                  <CirclePlus className="mb-2 h-8 w-8 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">
                    Create New Project
                  </span>
                </div>
              </DialogTrigger>
              <CreateProjectComponent />
            </Dialog>
            {projects &&
              projects.map((project) => (
                <ProjectCardComponent
                  key={project.id}
                  projectId={project.id}
                  projectTitle={project.name}
                  projectDescription={project.description}
                />
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectsPage;
