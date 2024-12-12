import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProjectVisibility } from "@/types/project";
import { useState } from "react";
import projectService from "@/services/projectService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CreateProjectComponent = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [visibility, setVisibility] = useState<ProjectVisibility>(
    ProjectVisibility.Public
  );
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreateProject = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError(null);
    try {
      const newProject = {
        name,
        description,
        visibility,
        team: "default-team",
      };

      await projectService.createProject(newProject);
      setName("");
      setDescription("");
      setVisibility(ProjectVisibility.Public);
      navigate(0);
      toast.success("Project created successfully!");
    } catch (error: any) {
      setError("Failed to create project. Please try again.");
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[800px]">
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
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
            required
            id="project-desc"
            className="col-span-3"
            placeholder="Type your message here."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label
            htmlFor="project-visibility"
            className="text-right block truncate font-semibold"
          >
            Visibility
          </Label>
          <RadioGroup
            id="project-visibility"
            className="col-span-3"
            value={visibility}
            onValueChange={(value) => setVisibility(value as ProjectVisibility)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={ProjectVisibility.Public} id="public" />
              <Label htmlFor="public">{ProjectVisibility.Public}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={ProjectVisibility.Private} id="private" />
              <Label htmlFor="private">{ProjectVisibility.Private}</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <DialogFooter>
        <form onSubmit={handleCreateProject}>
          <Button type="submit">Create</Button>
        </form>
      </DialogFooter>
    </DialogContent>
  );
};

export default CreateProjectComponent;
