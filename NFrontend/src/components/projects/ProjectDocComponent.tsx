import fileUploadService from "@/services/fileUploadService";
import { ProjectItem } from "@/types/project";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Sparkles } from "lucide-react";
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
} from "../ui/alert-dialog";
import toast from "react-hot-toast";
import taskService from "@/services/taskService";
import { URLS } from "@/types/url-constants";

interface Props {
  id: string;
}

const ProjectDocComponent: React.FC<Props> = ({ id }) => {
  const [projectItem, setProjectItem] = useState<ProjectItem | null>(null);
  const [isProjectItemAvailable, setIsProjectItemAvailable] = useState(false);

  useEffect(() => {
    // Don't fetch if id is undefined or invalid
    if (!id || id === "undefined") {
      return;
    }

    const fetchProjectItem = async () => {
      try {
        const projectItem = await fileUploadService.viewFile(id);
        setIsProjectItemAvailable(true);
        setProjectItem(projectItem);
      } catch (error) {
        console.log(error);
      }
    };
    fetchProjectItem();
  }, [id]);

  const handleGenerateTask = async () => {
    try {
      const response = await taskService.triggerTask({
        file_id: projectItem?.id,
      });
      // toast.success("Task generation initiated");
    } catch (error: any) {
      console.log(error);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-4">
      {isProjectItemAvailable && (
        <>
          {/* Project Details Header */}
          <div className="crm-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Project Requirements
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  View and manage project documentation
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate Tasks
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Generate AI Tasks?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will use AI to analyze the requirements document and
                      automatically generate tasks. Any existing AI-generated
                      tasks will be replaced.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleGenerateTask}>
                      Generate
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Project Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                <p className="text-xs text-muted-foreground mb-1">
                  Sprint Size
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {projectItem?.sprintsize} weeks
                </p>
              </div>
              <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                <p className="text-lg font-semibold text-foreground">
                  {projectItem?.timeline} weeks
                </p>
              </div>
              <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                <p className="text-xs text-muted-foreground mb-1">Created</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(projectItem?.created_at ?? "").toLocaleDateString()}
                </p>
              </div>
              <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                <p className="text-xs text-muted-foreground mb-1">Updated</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(projectItem?.updated_at ?? "").toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Document Viewer */}
          <div className="crm-card p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Requirements Document
            </h3>
            <div className="rounded-lg overflow-hidden border border-border">
              <embed
                src={`${URLS.BASE_URL}${projectItem?.file}`}
                width="100%"
                height="700px"
                type="application/pdf"
                className="bg-muted/20"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectDocComponent;
