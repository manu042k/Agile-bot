import { Folder, ArrowRight, Users, CheckCircle2 } from "lucide-react";
import React from "react";
import { getProjectStatusBadgeClass } from "@/lib/colorUtils";

interface Props {
  projectId: number;
  projectTitle: string;
  projectDescription: string;
  project?: {
    status: string;
    progress: number;
    tasks: number;
    completedTasks: number;
    team: number;
    color: string;
  };
}

const ProjectCardComponent: React.FC<Props> = ({
  projectId,
  projectTitle,
  projectDescription,
  project,
}) => {

  return (
    <div className="pm-card pm-card-hover p-6 h-full flex flex-col group cursor-pointer">
      {/* Header with Icon and Title */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Folder className="h-5 w-5 text-gray-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-gray-950 transition-colors mb-2">
            {projectTitle}
          </h3>
          {project && (
            <span className={`pm-badge border ${getProjectStatusBadgeClass(project.status)} inline-block`}>
              {project.status}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1 leading-relaxed">
        {projectDescription}
      </p>

      {/* Progress Bar */}
      {project && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {project && (
              <>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{project.completedTasks}/{project.tasks}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  <span>{project.team}</span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
            <span>View</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCardComponent;
