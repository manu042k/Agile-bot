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
import { TaskStatus, Task } from "@/types/project";
import taskService from "@/services/taskService";
import TaskCard from "@/components/projects/TaskCard";
import ProjectCard from "@/components/projects/ProjectCard";
import DetailsCard from "@/components/common/DetailsCard";
import EmptyState from "@/components/common/EmptyState";
import api from "@/interceptor/api";
import { URLS } from "@/types/url-constants";

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
  
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get(URLS.USER_ME);
        setCurrentUser(response.data);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

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

  // Calculate my tasks - filter by current user
  const myTasks = useMemo(() => {
    if (!currentUser) return [];
    
    return allTasks
      .filter(task => {
        // Check if task is not completed
        if (task.status === TaskStatus.Completed) return false;
        
        // Check if current user is assigned to this task
        if (!task.assigned_to || !Array.isArray(task.assigned_to)) return false;
        
        return task.assigned_to.some((assignee: any) => {
          const assigneeId = typeof assignee === 'object' ? assignee.id : assignee;
          return assigneeId === currentUser.id;
        });
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [allTasks, currentUser]);

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

  // Get recent projects (sorted by updated date)
  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
  }, [projects]);

  // Get top 3 for overview
  const topRecentProjects = useMemo(() => {
    return recentProjects.slice(0, 3);
  }, [recentProjects]);

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
                <Link href="/dashboard?tab=my-tasks" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <Separator className="my-4" />
              {myTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myTasks.slice(0, 4).map((task) => (
                    <TaskCard
                      key={task.taskid}
                      task={task}
                      projectId={task.Project}
                      compact={true}
                      onUpdate={(updatedTask) => {
                        setAllTasks(prev => 
                          prev.map(t => t.taskid === updatedTask.taskid ? updatedTask : t)
                        );
                      }}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CheckSquare}
                  title="No tasks assigned"
                  description="Tasks assigned to you will appear here"
                />
              )}
            </div>

            {/* Recent Projects */}
            <div className="pm-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
                <Link href="/dashboard?tab=projects" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <Separator className="my-4" />
              {topRecentProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topRecentProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      compact={true}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FolderKanban}
                  title="No recent projects"
                  description="Projects you work on will appear here"
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dashboard Details */}
            <DetailsCard
              title="Dashboard Details"
              items={[
                {
                  icon: FolderKanban,
                  label: "Total Projects",
                  value: stats.total,
                  iconBgColor: "bg-blue-100",
                  iconColor: "text-blue-600",
                },
                {
                  icon: TrendingUp,
                  label: "Active Projects",
                  value: stats.active,
                  iconBgColor: "bg-orange-100",
                  iconColor: "text-orange-600",
                },
                {
                  icon: CheckSquare,
                  label: "Total Tasks",
                  value: totalTasks,
                  iconBgColor: "bg-green-100",
                  iconColor: "text-green-600",
                },
                {
                  icon: Users,
                  label: "Team Members",
                  value: totalTeamMembers,
                  iconBgColor: "bg-purple-100",
                  iconColor: "text-purple-600",
                },
              ]}
            />

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
              <h2 className="text-lg font-semibold text-gray-900 mb-1">My Tasks</h2>
              <p className="text-sm text-gray-500 mb-4">Tasks assigned to you across all projects</p>
              <Separator className="my-4" />
              {myTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myTasks.map((task) => (
                    <TaskCard
                      key={task.taskid}
                      task={task}
                      projectId={task.Project}
                      compact={true}
                      onUpdate={(updatedTask) => {
                        setAllTasks(prev => 
                          prev.map(t => t.taskid === updatedTask.taskid ? updatedTask : t)
                        );
                      }}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CheckSquare}
                  title="No tasks assigned to you"
                  description="Tasks assigned to you will appear here"
                />
              )}
            </div>
          </div>
        )}

        {/* Recent Projects Tab */}
        {tab === "projects" && (
          <div className="space-y-6 mt-6">
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Recent Projects</h2>
              <p className="text-sm text-gray-500 mb-4">Your most recently updated projects</p>
              <Separator className="my-4" />
              {recentProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FolderKanban}
                  title="No recent projects"
                  description="Projects you work on will appear here"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

