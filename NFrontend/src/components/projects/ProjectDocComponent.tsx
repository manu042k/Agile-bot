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
    <div className="space-y-6">
      {isProjectItemAvailable && (
        <>
          {/* Project Item Header */}
          <Card>
            <CardHeader></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Project Details</h3>
                <AlertDialog>
                  <AlertDialogTrigger>
                    <Button variant="link">
                      {" "}
                      <Sparkles /> Generate Task
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone and will permanently delete
                        the AI-generated task and regenerate it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleGenerateTask}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="mt-2 ">
                <Badge variant="secondary" className="mr-2">
                  Sprint Size: {projectItem?.sprintsize} weeks
                </Badge>
                <Badge variant="secondary" className="mr-2">
                  Timeline: {projectItem?.timeline} weeks
                </Badge>
                <Badge variant="secondary" className="mr-2">
                  Created At:{" "}
                  {new Date(projectItem?.created_at ?? "").toLocaleDateString()}
                </Badge>
                <Badge variant="secondary" className="mr-2">
                  Updated At:{" "}
                  {new Date(projectItem?.updated_at ?? "").toLocaleDateString()}
                </Badge>
              </div>

              <Separator className="my-4" />
              {/* PDF Embed */}
              <div className="my-4">
                <embed
                  src={`${URLS.BASE_URL}${projectItem?.file}`}
                  width="100%"
                  height="600px"
                  type="application/pdf"
                  className="border border-muted rounded-lg"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProjectDocComponent;
