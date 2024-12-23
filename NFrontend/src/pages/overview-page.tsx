import React from "react";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "react-router-dom";
import "@react-pdf-viewer/core/lib/styles/index.css";
import ProjectDisplayComponent from "@/components/projects/ProjectDisplayComponent";
import ProjectDocComponent from "@/components/projects/ProjectDocComponent";
import WebSockets from "@/components/common/webSockets";

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
        <ProjectDocComponent id={projectId} />
      </div>
      <WebSockets></WebSockets>
    </>
  );
};

export default OverviewPage;
