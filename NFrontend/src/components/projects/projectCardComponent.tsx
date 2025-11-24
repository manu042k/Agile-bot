import { Folder } from "lucide-react";
import React from "react";
import Link from "next/link";
interface Props {
  projectId: number;
  projectTitle: string;
  projectDescription: string;
}
const ProjectCardComponent: React.FC<Props> = ({
  projectId,
  projectTitle,
  projectDescription,
}) => {
  return (
    <Link href={`/projects/${projectId}`} className="block group h-full">
      <div className="crm-card crm-card-hover h-full p-6 flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 shrink-0">
            <Folder className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {projectTitle}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {projectDescription.slice(0, 100)}
              {projectDescription.length > 100 ? "..." : ""}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Project #{projectId}</span>
            <span className="text-primary group-hover:translate-x-1 transition-transform">
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCardComponent;
