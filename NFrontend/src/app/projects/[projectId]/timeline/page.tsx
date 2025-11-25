"use client";
import { useParams } from "next/navigation";
import { Calendar, Clock, User, Flag } from "lucide-react";
import ProjectHeader from "@/components/projects/ProjectHeader";

// Mock timeline data
const getMockTimeline = (projectId: string) => ({
  startDate: "2024-01-15",
  endDate: "2024-06-30",
  milestones: [
    { id: 1, name: "Phase 1: Authentication", date: "2024-02-15", status: "completed" },
    { id: 2, name: "Phase 2: Product Catalog", date: "2024-03-30", status: "in_progress" },
    { id: 3, name: "Phase 3: Shopping Cart", date: "2024-04-30", status: "planned" },
    { id: 4, name: "Phase 4: Payment Integration", date: "2024-05-30", status: "planned" },
    { id: 5, name: "Phase 5: Testing & Launch", date: "2024-06-30", status: "planned" },
  ],
  tasks: [
    { id: 1, name: "Implement user authentication", start: "2024-01-20", end: "2024-02-15", assignee: "John Doe", status: "completed" },
    { id: 2, name: "Design product catalog UI", start: "2024-02-16", end: "2024-03-15", assignee: "Jane Smith", status: "in_progress" },
    { id: 3, name: "Set up shopping cart", start: "2024-03-16", end: "2024-04-15", assignee: "Mike Johnson", status: "planned" },
    { id: 4, name: "Payment integration", start: "2024-04-16", end: "2024-05-15", assignee: "Sarah Wilson", status: "planned" },
  ],
});

const TimelinePage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const timeline = getMockTimeline(projectId);

  const getDaysBetween = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getDaysFromStart = (date: string) => {
    const startDate = new Date(timeline.startDate);
    const taskDate = new Date(date);
    return Math.ceil((taskDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const totalDays = getDaysBetween(timeline.startDate, timeline.endDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader />
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Timeline</h1>
          <p className="text-gray-600">Visualize project schedule and task dependencies</p>
        </div>

        {/* Timeline Overview */}
        <div className="pm-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Project Schedule</h2>
              <p className="text-sm text-gray-600">
                {timeline.startDate} to {timeline.endDate}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-semibold text-gray-900">{totalDays}</p>
                <p className="text-xs text-gray-500">Total Days</p>
              </div>
            </div>
          </div>

          {/* Timeline Bar */}
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
            <div className="absolute inset-0 flex">
              {timeline.milestones.map((milestone, idx) => {
                const position = (getDaysFromStart(milestone.date) / totalDays) * 100;
                return (
                  <div
                    key={milestone.id}
                    className="absolute"
                    style={{ left: `${position}%` }}
                  >
                    <div className={`w-1 h-4 ${
                      milestone.status === "completed" ? "bg-gray-900" :
                      milestone.status === "in_progress" ? "bg-gray-600" :
                      "bg-gray-300"
                    }`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="pm-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h2>
          <div className="space-y-4">
            {timeline.milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  milestone.status === "completed" ? "bg-gray-900" :
                  milestone.status === "in_progress" ? "bg-gray-600" :
                  "bg-gray-200"
                }`}>
                  <Calendar className={`h-6 w-6 ${
                    milestone.status === "planned" ? "text-gray-600" : "text-white"
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{milestone.name}</h3>
                    <span className={`pm-badge ${
                      milestone.status === "completed" ? "bg-gray-800 text-white" :
                      milestone.status === "in_progress" ? "bg-gray-200" :
                      "bg-gray-100"
                    }`}>
                      {milestone.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {milestone.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="pm-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Timeline</h2>
          <div className="space-y-4">
            {timeline.tasks.map((task) => {
              const taskDays = getDaysBetween(task.start, task.end);
              const startOffset = getDaysFromStart(task.start);
              const width = (taskDays / totalDays) * 100;
              const left = (startOffset / totalDays) * 100;

              return (
                <div key={task.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm">{task.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assignee}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.start} - {task.end}
                        </span>
                      </div>
                    </div>
                    <span className={`pm-badge ${
                      task.status === "completed" ? "bg-gray-800 text-white" :
                      task.status === "in_progress" ? "bg-gray-200" :
                      "bg-gray-100"
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="relative h-8 bg-gray-100 rounded overflow-hidden">
                    <div
                      className={`absolute h-full rounded ${
                        task.status === "completed" ? "bg-orange-600" :
                        task.status === "in_progress" ? "bg-orange-400" :
                        "bg-gray-300"
                      }`}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;

