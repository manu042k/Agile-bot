"use client";
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
import { useRouter } from "next/navigation";

interface CreateProjectComponentProps {
  onSuccess?: () => void;
}

const CreateProjectComponent = ({ onSuccess }: CreateProjectComponentProps = {}) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [visibility, setVisibility] = useState<ProjectVisibility>(
    ProjectVisibility.Public
  );
  const [domain, setDomain] = useState<string>("");
  const [techStack, setTechStack] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        domain: domain || undefined,
        tech_stack: techStack ? techStack.split(',').map(t => t.trim()).filter(t => t) : undefined,
        deadline: deadline || undefined,
      };

      await projectService.createProject(newProject);
      setName("");
      setDescription("");
      setVisibility(ProjectVisibility.Public);
      setDomain("");
      setTechStack("");
      setDeadline("");
      toast.success("Project created successfully!");
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      setError("Failed to create project. Please try again.");
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900">Create Project</DialogTitle>
        <DialogDescription className="text-gray-600">
          Fill in the details to create a new project.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleCreateProject} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="project-name" className="text-sm font-medium text-gray-700">
            Project Name
          </Label>
          <Input
            id="project-name"
            placeholder="Enter project name"
            className="pm-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-desc" className="text-sm font-medium text-gray-700">
            Description
          </Label>
          <Textarea
            required
            id="project-desc"
            className="pm-input min-h-[100px]"
            placeholder="Enter project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-visibility" className="text-sm font-medium text-gray-700">
            Visibility
          </Label>
          <RadioGroup
            id="project-visibility"
            value={visibility}
            onValueChange={(value) => setVisibility(value as ProjectVisibility)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={ProjectVisibility.Public} id="public" />
              <Label htmlFor="public" className="font-normal cursor-pointer">{ProjectVisibility.Public}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={ProjectVisibility.Private} id="private" />
              <Label htmlFor="private" className="font-normal cursor-pointer">{ProjectVisibility.Private}</Label>
            </div>
          </RadioGroup>
        </div>

        {/* AI Context Fields - Optional */}
        <div className="border-t pt-4 space-y-4">
          <p className="text-sm font-medium text-gray-700">AI Task Generation Context (Optional)</p>
          
          <div className="space-y-2">
            <Label htmlFor="project-domain" className="text-sm font-medium text-gray-600">
              Domain
            </Label>
            <Input
              id="project-domain"
              placeholder="e.g., E-commerce, Healthcare, Finance"
              className="pm-input"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <p className="text-xs text-gray-500">Helps AI generate domain-specific tasks</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-tech-stack" className="text-sm font-medium text-gray-600">
              Technology Stack
            </Label>
            <Input
              id="project-tech-stack"
              placeholder="e.g., React, Django, PostgreSQL"
              className="pm-input"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
            />
            <p className="text-xs text-gray-500">Comma-separated list of technologies</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-deadline" className="text-sm font-medium text-gray-600">
              Deadline
            </Label>
            <Input
              id="project-deadline"
              type="date"
              className="pm-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <p className="text-xs text-gray-500">Helps AI prioritize tasks based on urgency</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="submit" className="pm-button-primary w-full sm:w-auto">
            Create Project
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default CreateProjectComponent;
