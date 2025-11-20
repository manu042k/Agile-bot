"use client";
import { 
  FolderKanban, 
  CheckSquare, 
  Users, 
  TrendingUp, 
  Clock,
  AlertCircle,
  Calendar,
  ArrowRight,
  Plus,
  LayoutDashboard,
  ListTodo,
  FolderOpen
} from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/common/PageHeader";

// Mock data
const mockStats = {
  totalProjects: 12,
  activeProjects: 8,
  totalTasks: 156,
  completedTasks: 98,
  teamMembers: 24,
  overdueTasks: 5,
};

const mockMyTasks = [
  { id: 1, title: "Implement user authentication", project: "E-Commerce Platform", dueDate: "2024-02-15", priority: "high", status: "in_progress" },
  { id: 2, title: "Design dashboard UI", project: "Analytics Dashboard", dueDate: "2024-02-18", priority: "medium", status: "todo" },
  { id: 3, title: "Write API documentation", project: "Mobile Banking App", dueDate: "2024-02-20", priority: "low", status: "todo" },
  { id: 4, title: "Review pull request #234", project: "E-Commerce Platform", dueDate: "2024-02-14", priority: "high", status: "todo" },
];

const mockRecentProjects = [
  { id: 1, name: "E-Commerce Platform", progress: 65, tasks: 24, completed: 16 },
  { id: 2, name: "Mobile Banking App", progress: 42, tasks: 18, completed: 8 },
  { id: 3, name: "AI Analytics Dashboard", progress: 78, tasks: 45, completed: 35 },
];

const mockUpcomingDeadlines = [
  { id: 1, title: "Sprint Planning", date: "2024-02-15", project: "E-Commerce Platform" },
  { id: 2, title: "Code Review", date: "2024-02-16", project: "Mobile Banking App" },
  { id: 3, title: "Release v2.0", date: "2024-02-20", project: "AI Analytics Dashboard" },
];

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your projects."
        icon={LayoutDashboard}
        tabs={[
          { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
          { icon: ListTodo, label: "My Tasks", href: "/dashboard?tab=my-tasks" },
          { icon: FolderOpen, label: "Recent Projects", href: "/dashboard?tab=projects" },
        ]}
      />

      <div className="px-6 py-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="pm-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <FolderKanban className="h-5 w-5 text-gray-700" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.totalProjects}</p>
              <p className="text-sm text-gray-600 mt-1">Total Projects</p>
            </div>
          </div>

          <div className="pm-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <CheckSquare className="h-5 w-5 text-gray-700" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.totalTasks}</p>
              <p className="text-sm text-gray-600 mt-1">Total Tasks</p>
            </div>
          </div>

          <div className="pm-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Users className="h-5 w-5 text-gray-700" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.teamMembers}</p>
              <p className="text-sm text-gray-600 mt-1">Team Members</p>
            </div>
          </div>

          <div className="pm-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <TrendingUp className="h-5 w-5 text-gray-700" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round((mockStats.completedTasks / mockStats.totalTasks) * 100)}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Completion Rate</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/projects" className="pm-card p-5 text-left group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <FolderKanban className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">View Projects</h3>
                    <p className="text-xs text-gray-500">All projects</p>
                  </div>
                </div>
              </Link>

              <Link href="/tasks" className="pm-card p-5 text-left group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <CheckSquare className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">View Tasks</h3>
                    <p className="text-xs text-gray-500">All tasks</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Dashboard Overview */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Overview</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium text-gray-900">
                      {Math.round((mockStats.completedTasks / mockStats.totalTasks) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full transition-all"
                      style={{ width: `${Math.round((mockStats.completedTasks / mockStats.totalTasks) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{mockStats.totalProjects}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Projects</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{mockStats.completedTasks}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed Tasks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{mockStats.teamMembers}</p>
                    <p className="text-xs text-gray-500 mt-1">Team Members</p>
                  </div>
                </div>
              </div>
            </div>

            {/* My Tasks */}
            <div className="pm-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
                <Link href="/tasks" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {mockMyTasks.map((task) => {
                  const projectId = task.id % 3 + 1; // Mock: derive from task ID
                  return (
                    <Link key={task.id} href={`/projects/${projectId}/task/${task.id}`}>
                      <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
                            <p className="text-sm text-gray-500">{task.project}</p>
                          </div>
                      <span className={`pm-badge ${
                        task.priority === "high" ? "pm-priority-high" :
                        task.priority === "medium" ? "pm-priority-medium" :
                        "pm-priority-low"
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {task.dueDate}
                        </span>
                        <span className={`pm-status-dot ${
                          task.status === "done" ? "pm-status-done" :
                          task.status === "in_progress" ? "pm-status-progress" :
                          task.status === "todo" ? "pm-status-todo" :
                          "pm-status-backlog"
                        }`} />
                        <span className="capitalize">{task.status.replace("_", " ")}</span>
                      </div>
                    </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Recent Projects */}
            <div className="pm-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
                <Link href="/projects" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {mockRecentProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                        <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-gray-900 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{project.completed}/{project.tasks} tasks completed</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dashboard Details */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Dashboard Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Active Projects</p>
                  <p className="text-sm font-medium text-gray-900">{mockStats.activeProjects}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Total Tasks</p>
                  <p className="text-sm font-medium text-gray-900">{mockStats.totalTasks}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Overdue Tasks</p>
                  <p className="text-sm font-medium text-gray-900">{mockStats.overdueTasks}</p>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
              <div className="space-y-3">
                {mockUpcomingDeadlines.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-1.5 rounded bg-gray-100 flex-shrink-0">
                      <Calendar className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.project}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overdue Tasks */}
            {mockStats.overdueTasks > 0 && (
              <div className="pm-card p-5 border-2 border-gray-300">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Overdue Tasks</h3>
                </div>
                <p className="text-2xl font-semibold text-gray-900 mb-1">{mockStats.overdueTasks}</p>
                <p className="text-sm text-gray-600">Tasks need attention</p>
                <Link href="/tasks?filter=overdue" className="text-sm text-gray-700 hover:text-gray-900 font-medium mt-3 inline-block">
                  View overdue →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

