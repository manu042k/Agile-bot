"use client";
import { useSearchParams } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  BarChart3,
  Activity,
  FileText,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Separator } from "@/components/ui/separator";
import ActivityFeed from "@/components/common/ActivityFeed";
import StatCard from "@/components/common/StatCard";
import CreateCard from "@/components/common/CreateCard";

// Mock analytics data
const mockMetrics = {
  totalProjects: 12,
  activeProjects: 8,
  completedProjects: 3,
  totalTasks: 156,
  completedTasks: 98,
  inProgressTasks: 35,
  overdueTasks: 5,
  teamMembers: 24,
  averageCompletionTime: "4.2 days",
  productivityScore: 87,
};

const mockChartData = [
  { month: "Jan", completed: 45, created: 60 },
  { month: "Feb", completed: 52, created: 65 },
  { month: "Mar", completed: 48, created: 70 },
  { month: "Apr", completed: 61, created: 75 },
  { month: "May", completed: 55, created: 80 },
  { month: "Jun", completed: 67, created: 85 },
];

const AnalyticsPage = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "overview";

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Analytics"
        description="Track performance and productivity metrics across your projects"
        icon={BarChart3}
        tabs={[
          { icon: BarChart3, label: "Overview", href: "/analytics" },
          {
            icon: Activity,
            label: "Performance",
            href: "/analytics?tab=performance",
          },
          { icon: FileText, label: "Reports", href: "/analytics?tab=reports" },
        ]}
      />

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Tab */}
            {tab === "overview" && (
              <>
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <CreateCard
                    title="Export Report"
                    description="Download data"
                    icon={TrendingUp}
                    iconBgColor="bg-gray-100 group-hover:bg-gray-200"
                    iconColor="text-gray-700"
                  />
                  <CreateCard
                    title="Date Range"
                    description="Select period"
                    icon={Calendar}
                    iconBgColor="bg-gray-100 group-hover:bg-gray-200"
                    iconColor="text-gray-700"
                  />
                </div>

                {/* Analytics Overview */}
                <div className="pm-card p-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Analytics Overview
                  </h2>
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">
                          Productivity Score
                        </span>
                        <span className="font-medium text-gray-900">
                          {mockMetrics.productivityScore}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-600 rounded-full transition-all"
                          style={{ width: `${mockMetrics.productivityScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                      <StatCard
                        icon={CheckCircle2}
                        value={mockMetrics.completedTasks}
                        label="Completed"
                        className="p-0 border-0 shadow-none bg-transparent"
                        iconBgColor="bg-green-100"
                        iconColor="text-green-600"
                      />
                      <StatCard
                        icon={Clock}
                        value={mockMetrics.inProgressTasks}
                        label="In Progress"
                        className="p-0 border-0 shadow-none bg-transparent"
                        iconBgColor="bg-orange-100"
                        iconColor="text-orange-600"
                      />
                      <StatCard
                        icon={Users}
                        value={mockMetrics.teamMembers}
                        label="Team Members"
                        className="p-0 border-0 shadow-none bg-transparent"
                        iconBgColor="bg-purple-100"
                        iconColor="text-purple-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard
                    icon={CheckCircle2}
                    value={mockMetrics.completedTasks}
                    label="Tasks Completed"
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                  />
                  <StatCard
                    icon={Clock}
                    value={mockMetrics.averageCompletionTime}
                    label="Avg. Completion Time"
                    iconBgColor="bg-orange-100"
                    iconColor="text-orange-600"
                  />
                  <StatCard
                    icon={Users}
                    value={mockMetrics.teamMembers}
                    label="Team Members"
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                  />
                  <StatCard
                    icon={TrendingUp}
                    value={`${mockMetrics.productivityScore}%`}
                    label="Productivity Score"
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                  />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Task Completion Chart */}
                  <div className="pm-card p-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Task Completion Trend
                    </h2>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      {mockChartData.map((data, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{data.month}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-500">
                                Created: {data.created}
                              </span>
                              <span className="text-gray-900 font-medium">
                                Completed: {data.completed}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-8 bg-gray-100 rounded overflow-hidden flex">
                              <div
                                className="bg-gray-300"
                                style={{
                                  width: `${(data.created / 100) * 100}%`,
                                }}
                              />
                              <div
                                className="bg-orange-600"
                                style={{
                                  width: `${(data.completed / 100) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-12 text-right">
                              {Math.round(
                                (data.completed / data.created) * 100
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Status Distribution */}
                  <div className="pm-card p-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Project Status
                    </h2>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            Active Projects
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {mockMetrics.activeProjects}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{
                              width: `${
                                (mockMetrics.activeProjects /
                                  mockMetrics.totalProjects) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            Completed Projects
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {mockMetrics.completedProjects}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-600 rounded-full"
                            style={{
                              width: `${
                                (mockMetrics.completedProjects /
                                  mockMetrics.totalProjects) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            Planning
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {mockMetrics.totalProjects -
                              mockMetrics.activeProjects -
                              mockMetrics.completedProjects}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-300 rounded-full"
                            style={{
                              width: `${
                                ((mockMetrics.totalProjects -
                                  mockMetrics.activeProjects -
                                  mockMetrics.completedProjects) /
                                  mockMetrics.totalProjects) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Task Status Breakdown */}
                  <div className="pm-card p-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Task Status Breakdown
                    </h2>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="pm-status-dot pm-status-done" />
                          <span className="text-sm font-medium text-gray-900">
                            Completed
                          </span>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">
                          {mockMetrics.completedTasks}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="pm-status-dot pm-status-progress" />
                          <span className="text-sm font-medium text-gray-900">
                            In Progress
                          </span>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">
                          {mockMetrics.inProgressTasks}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="pm-status-dot pm-status-todo" />
                          <span className="text-sm font-medium text-gray-900">
                            To Do
                          </span>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">
                          {mockMetrics.totalTasks -
                            mockMetrics.completedTasks -
                            mockMetrics.inProgressTasks}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="pm-status-dot pm-status-backlog" />
                          <span className="text-sm font-medium text-gray-900">
                            Overdue
                          </span>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">
                          {mockMetrics.overdueTasks}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Team Performance */}
                  <div className="pm-card p-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Team Performance
                    </h2>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => {
                        const performance = 60 + Math.random() * 40;
                        return (
                          <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-900">
                                Team Member {i}
                              </span>
                              <span className="text-gray-600">
                                {Math.round(performance)}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-600 rounded-full transition-all"
                                style={{ width: `${performance}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Performance Tab */}
            {tab === "performance" && (
              <div className="pm-card p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Performance Metrics
                </h2>
                <Separator className="my-4" />
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard
                      icon={TrendingUp}
                      value="42"
                      label="Velocity (Tasks/week)"
                      iconBgColor="bg-blue-100"
                      iconColor="text-blue-600"
                    />
                    <StatCard
                      icon={Activity}
                      value="68%"
                      label="Burn Rate (On track)"
                      iconBgColor="bg-green-100"
                      iconColor="text-green-600"
                    />
                  </div>
                  <div className="pm-card p-6">
                    <h3 className="font-semibold text-gray-900">
                      Sprint Performance
                    </h3>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              Sprint {i}
                            </p>
                            <p className="text-xs text-gray-500">Week {i}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {75 + i * 5}%
                            </p>
                            <p className="text-xs text-gray-500">Completed</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {tab === "reports" && (
              <div className="pm-card p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Generated Reports
                </h2>
                <Separator className="my-4" />
                <div className="space-y-3">
                  {[
                    {
                      name: "Q1 2024 Summary",
                      date: "2024-03-31",
                      type: "Summary",
                    },
                    {
                      name: "Team Performance Report",
                      date: "2024-03-28",
                      type: "Performance",
                    },
                    {
                      name: "Task Analytics",
                      date: "2024-03-25",
                      type: "Analytics",
                    },
                  ].map((report, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {report.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {report.type} • {report.date}
                        </p>
                      </div>
                      <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Analytics Details */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900">
                Analytics Details
              </h3>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Total Projects</p>
                  <p className="text-sm font-medium text-gray-900">
                    {mockMetrics.totalProjects}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">
                    Active Projects
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {mockMetrics.activeProjects}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Overdue Tasks</p>
                  <p className="text-sm font-medium text-gray-900">
                    {mockMetrics.overdueTasks}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <ActivityFeed limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
