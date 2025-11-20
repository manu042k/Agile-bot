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
    if (!id || id === 'undefined') {
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
    <div className="space-y-6">
      {isProjectItemAvailable && (
        <>
          {/* Professional Project Details Header */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Project Requirements
                </h2>
                <p className="text-gray-600 text-lg">
                  View and manage project documentation
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="gap-2 bg-black hover:bg-gray-900 text-white font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-all">
                    <Sparkles className="w-5 h-5" />
                    Generate Tasks
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Generate AI Tasks?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will use AI to analyze the requirements document and automatically 
                      generate tasks. Any existing AI-generated tasks will be replaced.
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

            {/* Professional Project Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-5 border-2 border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Sprint Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projectItem?.sprintsize} weeks
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-5 border-2 border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Timeline</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projectItem?.timeline} weeks
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-5 border-2 border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Created</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(projectItem?.created_at ?? "").toLocaleDateString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-5 border-2 border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Updated</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(projectItem?.updated_at ?? "").toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Document Viewer */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-sm">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              Requirements Document
            </h3>
            <div className="rounded-lg overflow-hidden border-2 border-gray-300">
              <embed
                src={`${URLS.BASE_URL}${projectItem?.file}`}
                width="100%"
                height="700px"
                type="application/pdf"
                className="bg-gray-50"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectDocComponent;
