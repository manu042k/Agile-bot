import React from "react";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "react-router-dom";
import ProjectOverviewComponent from "@/components/projects/ProjectOverviewComponent";
import "@react-pdf-viewer/core/lib/styles/index.css";
import ProjectDisplayComponent from "@/components/projects/ProjectDisplayComponent";
import ProjectDocComponent from "@/components/projects/ProjectDocComponent";

const OverviewPage: React.FC = () => {
  const location = useLocation();
  const projectId = location.pathname.split("/")[2];

  return (
    <div className="space-y-6">
      <ProjectDisplayComponent id={projectId}></ProjectDisplayComponent>
      <Separator className="my-4" />
      <ProjectOverviewComponent />
      <ProjectDocComponent id={projectId} />
    </div>
  );
};

export default OverviewPage;
