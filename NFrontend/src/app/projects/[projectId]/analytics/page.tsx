"use client";
import { useParams } from "next/navigation";
import { TrendingUp, CheckCircle2, Clock, Users, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import ProjectHeader from "@/components/projects/ProjectHeader";

// Mock analytics data
const getMockAnalytics = (projectId: string) => ({
  overview: {
    totalTasks: 24,
    completedTasks: 16,
    inProgressTasks: 5,
    backlogTasks: 3,
    completionRate: 67,
    avgTaskCompletion: 4.2,
  },
  velocity: {
    current: 8,
    previous: 6,
    trend: "up",
  },
  burndown: [
    { date: "2024-01-15", remaining: 24 },
    { date: "2024-01-22", remaining: 22 },
    { date: "2024-01-29", remaining: 20 },
    { date: "2024-02-05", remaining: 18 },
    { date: "2024-02-12", remaining: 16 },
  ],
  taskCompletion: [
    { week: "Week 1", completed: 2 },
    { week: "Week 2", completed: 4 },
    { week: "Week 3", completed: 3 },
    { week: "Week 4", completed: 5 },
    { week: "Week 5", completed: 2 },
  ],
  teamPerformance: [
    { name: "John Doe", tasksCompleted: 8, avgTime: "2.5 days", efficiency: 95 },
    { name: "Jane Smith", tasksCompleted: 6, avgTime: "3.2 days", efficiency: 88 },
    { name: "Mike Johnson", tasksCompleted: 5, avgTime: "4.1 days", efficiency: 82 },
    { name: "Sarah Wilson", tasksCompleted: 4, avgTime: "3.8 days", efficiency: 85 },
  ],
  statusDistribution: {
    backlog: 3,
    todo: 3,
    inProgress: 5,
    done: 16,
  },
});

const ProjectAnalyticsPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const analytics = getMockAnalytics(projectId);

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader />
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Track project progress and team performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="pm-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <CheckCircle2 className="h-5 w-5 text-gray-700" />
              </div>
              {analytics.velocity.trend === "up" ? (
                <ArrowUp className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className="text-2xl font-semibold text-gray-900">{analytics.overview.completionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Completion Rate</p>
          </div>

          <div className="pm-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <TrendingUp className="h-5 w-5 text-gray-700" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{analytics.velocity.current}</p>
            <p className="text-xs text-gray-500 mt-1">Tasks/Week (Velocity)</p>
          </div>

          <div className="pm-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Clock className="h-5 w-5 text-gray-700" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{analytics.overview.avgTaskCompletion}</p>
            <p className="text-xs text-gray-500 mt-1">Avg Days/Task</p>
          </div>

          <div className="pm-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Users className="h-5 w-5 text-gray-700" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">5</p>
            <p className="text-xs text-gray-500 mt-1">Team Members</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Burndown Chart */}
          <div className="pm-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Burndown Chart</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.burndown.map((point, idx) => {
                const maxRemaining = Math.max(...analytics.burndown.map(p => p.remaining));
                const height = (point.remaining / maxRemaining) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center justify-end h-full">
                      <div
                        className="w-full bg-gray-900 rounded-t transition-all"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs font-medium text-gray-700 mt-1">{point.remaining}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Completion Trend */}
          <div className="pm-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Trend</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.taskCompletion.map((week, idx) => {
                const maxCompleted = Math.max(...analytics.taskCompletion.map(w => w.completed));
                const height = (week.completed / maxCompleted) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center justify-end h-full">
                      <div
                        className="w-full bg-gray-600 rounded-t transition-all"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{week.week}</p>
                    <p className="text-xs font-medium text-gray-700 mt-1">{week.completed}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="pm-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.statusDistribution).map(([status, count]) => {
              const total = Object.values(analytics.statusDistribution).reduce((a, b) => a + b, 0);
              const percentage = (count / total) * 100;
              return (
                <div key={status} className="text-center">
                  <div className="text-3xl font-semibold text-gray-900 mb-2">{count}</div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gray-900 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 capitalize">{status.replace(/([A-Z])/g, " $1").trim()}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Performance */}
        <div className="pm-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h2>
          <div className="space-y-4">
            {analytics.teamPerformance.map((member, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-medium flex-shrink-0">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span>{member.tasksCompleted} tasks completed</span>
                    <span>Avg: {member.avgTime}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{member.efficiency}%</p>
                  <p className="text-xs text-gray-500">Efficiency</p>
                </div>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 rounded-full"
                    style={{ width: `${member.efficiency}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalyticsPage;

