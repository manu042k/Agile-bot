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
          <div className="grid auto-rows-min gap-4 md:grid-cols-3 mt-2">
            <Dialog>
              {/* Trigger */}
              <DialogTrigger asChild>
                <a className="block group aspect-video rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors">
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-300 group-hover:bg-gray-400 transition-colors">
                      <CirclePlus className="w-6 h-6 text-black group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-black group-hover:text-gray-900">
                      Add Project
                    </h3>
                  </div>
                </a>
              </DialogTrigger>
              <CreateProjectComponent></CreateProjectComponent>
              {/* Dialog Content */}
            </Dialog>

            {projects?.map((project) => (
              <ProjectCardComponent
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
