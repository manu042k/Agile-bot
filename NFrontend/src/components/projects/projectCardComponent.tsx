import { Folder } from "lucide-react";
import React from "react";

interface Props {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
}
const ProjectCardComponent: React.FC<Props> = ({
  projectId,
  projectTitle,
  projectDescription,
}) => {
  return (
    <a
      href="#"
      className="block group aspect-video rounded-xl bg-slate-100 hover:bg-muted/70 transition-colors"
    >
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="flex mt-5 items-center justify-center w-12 h-12 rounded-full bg-gray-300 group-hover:bg-gray-400 transition-colors">
          <Folder className="w-6 h-6 text-black group-hover:text-white transition-colors" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-black group-hover:text-gray-900">
          {projectTitle}
        </h3>
        <p className="mt-2 text-sm text-gray-600 group-hover:text-gray-800 text-center">
          {projectDescription}
        </p>
      </div>
    </a>
  );
};

export default ProjectCardComponent;
