import fileUploadService from "@/services/fileUploadService";
import { ProjectItem } from "@/types/project";
import React, { useEffect, useState } from "react";
import { set } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

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

  return (
    <div className="space-y-6">
      {isProjectItemAvailable && (
        <>
          {/* Project Item Header */}
          <Card>
            <CardHeader></CardHeader>
            <CardContent>
              <h3 className="text-xl font-bold">Project Details</h3>
              <div className="mt-2">
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
                  src={`http://localhost:8000${projectItem?.file}`}
                  width="100%"
                  height="600px"
                  type="application/pdf"
                  className="border border-muted rounded-lg"
                />
              </div>
              {/* Action Button */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => alert("Further Actions")}
                  className="w-full"
                >
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProjectDocComponent;
