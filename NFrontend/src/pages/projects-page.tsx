import NavBarComponent from "@/components/common/NavBarComponent";
import { CirclePlus, Folder } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ProjectCardComponent from "@/components/projects/projectCardComponent";

const ProjectsPage = () => {
  const projects = Array.from({ length: 10 }, (_, index) => ({
    projectId: `project-${index + 1}`,
    projectTitle: `Project Title ${index + 1}`,
    projectDescription: `Description for Project ${index + 1}`,
  }));
  return (
    <>
      <div className="flex h-screen">
        <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-visible">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3 mt-2">
            <Dialog>
              {/* Trigger */}
              <DialogTrigger asChild>
                <a
                  href="#"
                  className="block group aspect-video rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors"
                >
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

              {/* Dialog Content */}
              <DialogContent className="sm:max-w-[425px]  md:max-w-[700px] lg:max-w-[800px] ">
                <DialogHeader>
                  <DialogTitle>Add New Project</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new project.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="project-name"
                      className="text-right block truncate font-semibold"
                    >
                      Project Name
                    </Label>
                    <Input
                      id="project-name"
                      placeholder="Enter project name"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="project-desc"
                      className="text-right block truncate font-semibold"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="project-desc"
                      className="col-span-3"
                      placeholder="Type your message here."
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="project-desc"
                      className="text-right block truncate font-semibold"
                    >
                      Visibilty
                    </Label>
                    <RadioGroup defaultValue="comfortable">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="default" id="r1" />
                        <Label htmlFor="r1">Public</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="comfortable" id="r2" />
                        <Label htmlFor="r2">Private</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* <ProjectCardComponent
            projectId={"test"}
            projectTitle={"test"}
            projectDescription={"test"}
          /> */}

            {projects.map((project) => (
              <ProjectCardComponent
                key={project.projectId} // Use a unique key for each item
                projectId={project.projectId}
                projectTitle={project.projectTitle}
                projectDescription={project.projectDescription}
              />
            ))}
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>

        {/* Model */}
      </div>
    </>
  );
};

export default ProjectsPage;
