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
    <>
      {/* Sticky ProjectDisplayComponent */}
      <div className="sticky top-12 w-full bg-white shadow-sm z-10 p-8">
        <ProjectDisplayComponent id={projectId} />
      </div>

      {/* Separator */}
      <Separator className="my-6" />

      {/* Scrollable content below the sticky header */}
      <div className="px-4 md:px-8 h-[calc(100vh-200px)] overflow-y-auto">
        <ProjectOverviewComponent />
        <Separator className="my-6" />

        <ProjectDocComponent id={projectId} />
      </div>
    </>
  );
};

export default OverviewPage;
