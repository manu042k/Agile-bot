"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
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
  FolderOpen,
  Loader2
} from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/common/PageHeader";
import { Separator } from "@/components/ui/separator";
import { useProjects } from "@/hooks/useProjects";
import { useActivities } from "@/hooks/useActivities";
import ActivityFeed from "@/components/common/ActivityFeed";
import StatCard from "@/components/common/StatCard";
import CreateCard from "@/components/common/CreateCard";
import { TaskStatus } from "@/types/project";
import taskService from "@/services/taskService";

const DashboardPage = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  
  const { 
    projects = [], 
    loading: projectsLoading, 
    stats = { total: 0, active: 0, completed: 0, planning: 0 }, 
    overallProgress = 0, 
    totalTasks = 0, 
    completedTasks = 0 
  } = useProjects();
  const { activities = [], loading: activitiesLoading } = useActivities({ limit: 10 });
  
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Fetch all tasks across all projects
  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        setTasksLoading(true);
        const tasksPromises = projects.map(project => 
          taskService.getTasks(project.id.toString()).catch(() => [])
        );
        const tasksArrays = await Promise.all(tasksPromises);
        const tasks = tasksArrays.flat();
        setAllTasks(tasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setTasksLoading(false);
      }
    };

    if (projects.length > 0) {
      fetchAllTasks();
    } else {
      setTasksLoading(false);
    }
  }, [projects]);

  // Calculate my tasks (show recent tasks - ideally we'd filter by current user from backend)
  const myTasks = useMemo(() => {
    // For now, show the most recently created tasks
    // TODO: Add backend endpoint to fetch current user's tasks
    return allTasks
      .filter(task => task.status !== TaskStatus.Completed)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4);
  }, [allTasks]);

  // Calculate team members count
  const totalTeamMembers = useMemo(() => {
    const uniqueMembers = new Set();
    projects.forEach(project => {
      project.team?.members?.forEach((member: any) => {
        uniqueMembers.add(member.user?.id || member.id);
      });
    });
    return uniqueMembers.size;
  }, [projects]);

  // Get recent projects (top 3 by updated date)
  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 3);
  }, [projects]);

  const loading = projectsLoading || tasksLoading;

  if (loading) {
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
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Overview Tab */}
        {tab === "overview" && (
          <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-6">
          <StatCard
            icon={FolderKanban}
            value={stats.total}
            label="Total Projects"
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={CheckSquare}
            value={totalTasks}
            label="Total Tasks"
            iconBgColor="bg-gray-100"
            iconColor="text-gray-700"
          />
          <StatCard
            icon={Users}
            value={totalTeamMembers}
            label="Team Members"
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
          <StatCard
            icon={TrendingUp}
            value={`${overallProgress}%`}
            label="Completion Rate"
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <CreateCard
                title="View Projects"
                description="All projects"
                icon={FolderKanban}
                href="/projects"
                iconBgColor="bg-gray-100 group-hover:bg-gray-200"
                iconColor="text-gray-700"
              />
              <CreateCard
                title="View Tasks"
                description="All tasks"
                icon={CheckSquare}
                href="/tasks"
                iconBgColor="bg-gray-100 group-hover:bg-gray-200"
                iconColor="text-gray-700"
              />
            </div>

            {/* Dashboard Overview */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">Dashboard Overview</h2>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium text-gray-900">{overallProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full transition-all"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <StatCard
                    icon={FolderKanban}
                    value={stats.total}
                    label="Total Projects"
                    className="p-0 border-0 shadow-none bg-transparent"
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                  />
                  <StatCard
                    icon={CheckSquare}
                    value={completedTasks}
                    label="Completed Tasks"
                    className="p-0 border-0 shadow-none bg-transparent"
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                  />
                  <StatCard
                    icon={Users}
                    value={totalTeamMembers}
                    label="Team Members"
                    className="p-0 border-0 shadow-none bg-transparent"
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* My Tasks */}
            <div className="pm-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
                <Link href="/tasks" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <Separator className="my-4" />
              {myTasks.length > 0 ? (
                <div className="space-y-3">
                  {myTasks.map((task) => {
                    const projectInfo = projects.find(p => p.id.toString() === task.Project);
                    return (
                      <Link key={task.taskid} href={`/projects/${task.Project}`}>
                        <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">{task.name}</h3>
                              <p className="text-sm text-gray-500">{projectInfo?.name || "Unknown Project"}</p>
                            </div>
                            {task.priority && (
                              <span className={`pm-badge ${
                                task.priority === "high" ? "pm-priority-high" :
                                task.priority === "medium" ? "pm-priority-medium" :
                                "pm-priority-low"
                              }`}>
                                {task.priority}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(task.created_at).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                                task.status === TaskStatus.Completed ? "bg-gray-800 text-white border-gray-800" :
                                task.status === TaskStatus.Active ? "bg-orange-100 text-orange-800 border-orange-300" :
                                task.status === TaskStatus.Created ? "bg-blue-100 text-blue-800 border-blue-300" :
                                "bg-gray-100 text-gray-800 border-gray-300"
                              }`}>
                                {task.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p>No tasks assigned to you</p>
                </div>
              )}
            </div>

            {/* Recent Projects */}
            <div className="pm-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
                <Link href="/projects" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <Separator className="my-4" />
              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900">{project.name}</h3>
                          <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full bg-orange-600 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{project.completedTasks}/{project.tasks} tasks completed</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FolderKanban className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p>No recent projects</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dashboard Details */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900">Dashboard Details</h3>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Active Projects</p>
                  <p className="text-sm font-medium text-gray-900">{stats.active}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Completed Projects</p>
                  <p className="text-sm font-medium text-gray-900">{stats.completed}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Total Tasks</p>
                  <p className="text-sm font-medium text-gray-900">{totalTasks}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <ActivityFeed 
              activities={activities.slice(0, 5)} 
              loading={activitiesLoading}
              compact 
            />

            {/* Recent Tasks Summary */}
            {myTasks.length > 0 && (
              <div className="pm-card p-5 border-2 border-gray-300">
                <div className="flex items-center gap-2 mb-3">
                  <CheckSquare className="h-5 w-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Recent Tasks</h3>
                </div>
                <p className="text-2xl font-semibold text-gray-900 mb-1">{myTasks.length}</p>
                <p className="text-sm text-gray-600">Active incomplete tasks</p>
                <Link href="/dashboard?tab=my-tasks" className="text-sm text-gray-700 hover:text-gray-900 font-medium mt-3 inline-block">
                  View all →
                </Link>
              </div>
            )}
          </div>
        </div>
          </>
        )}

        {/* My Tasks Tab */}
        {tab === "my-tasks" && (
          <div className="space-y-6 mt-6">
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
              <Separator className="my-4" />
              {myTasks.length > 0 ? (
                <div className="space-y-3">
                  {myTasks.map((task) => {
                    const projectInfo = projects.find(p => p.id.toString() === task.Project);
                    return (
                      <Link key={task.taskid} href={`/projects/${task.Project}`}>
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{task.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{projectInfo?.name || "Unknown Project"}</span>
                              <span>•</span>
                              <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                              {task.priority && (
                                <>
                                  <span>•</span>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    task.priority === "high" ? "pm-priority-high" :
                                    task.priority === "medium" ? "pm-priority-medium" :
                                    "pm-priority-low"
                                  }`}>
                                    {task.priority}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded text-xs font-medium border ${
                            task.status === TaskStatus.Completed ? "bg-gray-800 text-white border-gray-800" :
                            task.status === TaskStatus.Active ? "bg-orange-100 text-orange-800 border-orange-300" :
                            task.status === TaskStatus.Created ? "bg-blue-100 text-blue-800 border-blue-300" :
                            "bg-gray-100 text-gray-800 border-gray-300"
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">No tasks assigned to you</p>
                  <p className="text-sm text-gray-500">Tasks assigned to you will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Projects Tab */}
        {tab === "projects" && (
          <div className="space-y-6 mt-6">
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
              <Separator className="my-4" />
              {recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            <span>{project.completedTasks}/{project.tasks} tasks completed</span>
                            <span>•</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                              project.status === "completed" ? "bg-gray-800 text-white border-gray-800" :
                              project.status === "active" ? "bg-orange-100 text-orange-800 border-orange-300" :
                              "bg-gray-100 text-gray-800 border-gray-300"
                            }`}>
                              {project.status}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-600 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xl font-bold text-gray-900">{project.progress}%</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderKanban className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">No recent projects</p>
                  <p className="text-sm text-gray-500">Projects you work on will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

