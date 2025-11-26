"use client";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { TrendingUp, CheckCircle2, Clock, Users, Calendar, ArrowUp, ArrowDown, Loader2, BarChart3 } from "lucide-react";
import ProjectHeader from "@/components/projects/ProjectHeader";
import { Separator } from "@/components/ui/separator";
import projectService from "@/services/projectService";
import taskService from "@/services/taskService";
import { Project, Task, TaskStatus } from "@/types/project";
import toast from "react-hot-toast";

const ProjectAnalyticsPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectData, tasksData] = await Promise.all([
          projectService.getProject(projectId),
          taskService.getTasks(projectId),
        ]);
        setProject(projectData);
        setTasks(tasksData);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching analytics data:", err);
        setError(err.message || "Failed to fetch analytics data");
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Calculate analytics from tasks
  const analytics = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === TaskStatus.Completed);
    const inProgressTasks = tasks.filter(t => t.status === TaskStatus.Active || t.status === TaskStatus.Created);
    const backlogTasks = tasks.filter(t => t.status === TaskStatus.Backlog);

    const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

    // Calculate average days to completion for completed tasks
    const completedWithDates = completedTasks.filter(t => {
      if (!t.updated_at) return false;
      const created = new Date(t.created_at);
      const updated = new Date(t.updated_at);
      return !isNaN(created.getTime()) && !isNaN(updated.getTime());
    });
    const avgDays = completedWithDates.length > 0 
      ? completedWithDates.reduce((sum, task) => {
          const created = new Date(task.created_at).getTime();
          const completed = new Date(task.updated_at!).getTime();
          const days = Math.abs((completed - created) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / completedWithDates.length
      : 0;

    // Calculate task distribution by status
    const statusDistribution = {
      backlog: backlogTasks.length,
      created: tasks.filter(t => t.status === TaskStatus.Created).length,
      active: tasks.filter(t => t.status === TaskStatus.Active).length,
      completed: completedTasks.length,
    };

    // Group tasks by week for completion trend (last 5 weeks)
    const now = new Date();
    const taskCompletion = [];
    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const tasksInWeek = completedTasks.filter(t => {
        if (!t.updated_at) return false;
        const updated = new Date(t.updated_at);
        return updated >= weekStart && updated < weekEnd;
      });

      taskCompletion.push({
        week: `Week ${5 - i}`,
        completed: tasksInWeek.length,
      });
    }

    // Team performance - calculate per member stats
    const memberStats = new Map<string, { tasksCompleted: number; totalDays: number }>();
    
    completedWithDates.forEach(task => {
      const assignees = Array.isArray(task.assigned_to) ? task.assigned_to : [];
      assignees.forEach((assignee: any) => {
        const email = assignee.email || assignee;
        if (!memberStats.has(email)) {
          memberStats.set(email, { tasksCompleted: 0, totalDays: 0 });
        }
        
        const stats = memberStats.get(email)!;
        stats.tasksCompleted++;
        
        const created = new Date(task.created_at).getTime();
        const completed = new Date(task.updated_at!).getTime();
        const days = Math.abs((completed - created) / (1000 * 60 * 60 * 24));
        stats.totalDays += days;
      });
    });

    const teamPerformance = Array.from(memberStats.entries()).map(([email, stats]) => ({
      name: email.split('@')[0],
      email,
      tasksCompleted: stats.tasksCompleted,
      avgTime: stats.tasksCompleted > 0 
        ? `${(stats.totalDays / stats.tasksCompleted).toFixed(1)} days`
        : "N/A",
      efficiency: stats.tasksCompleted > 0
        ? Math.min(100, Math.round((stats.tasksCompleted / (stats.totalDays / stats.tasksCompleted)) * 10))
        : 0,
    })).sort((a, b) => b.tasksCompleted - a.tasksCompleted);

    return {
      overview: {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        backlogTasks: backlogTasks.length,
        completionRate,
        avgTaskCompletion: avgDays,
      },
      statusDistribution,
      taskCompletion,
      teamPerformance,
    };
  }, [tasks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="px-6 py-8">
          <div className="pm-card p-8 text-center border-red-200 bg-red-50">
            <p className="text-red-600 font-medium mb-2">Failed to load analytics</p>
            <p className="text-sm text-red-500">{error || "Project not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Track project progress and team performance</p>
          </div>
          <div className="pm-card p-12 text-center">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">No data available</p>
            <p className="text-sm text-gray-500">Create tasks to see analytics and insights</p>
          </div>
        </div>
      </div>
    );
  }

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
            <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalTasks}</p>
            <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
          </div>

          <div className="pm-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Clock className="h-5 w-5 text-gray-700" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{analytics.overview.avgTaskCompletion.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">Avg Days/Task</p>
          </div>

          <div className="pm-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Users className="h-5 w-5 text-gray-700" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{project?.team?.members?.length || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Team Members</p>
          </div>
        </div>

        {/* Task Completion Trend */}
        <div className="pm-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Task Completion Trend (Last 5 Weeks)</h2>
          <Separator className="my-4" />
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.taskCompletion.map((week, idx) => {
              const maxCompleted = Math.max(...analytics.taskCompletion.map(w => w.completed), 1);
              const height = (week.completed / maxCompleted) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    <div
                      className="w-full bg-orange-600 rounded-t transition-all"
                      style={{ height: height > 0 ? `${height}%` : '8px' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{week.week}</p>
                  <p className="text-xs font-medium text-gray-700 mt-1">{week.completed}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="pm-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Status Distribution</h2>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.statusDistribution).map(([status, count]) => {
              const total = Object.values(analytics.statusDistribution).reduce((a, b) => a + b, 0);
              const percentage = (count / total) * 100;
              return (
                <div key={status} className="text-center">
                  <div className="text-3xl font-semibold text-gray-900 mb-2">{count}</div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-orange-600 rounded-full"
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
          <h2 className="text-lg font-semibold text-gray-900">Team Performance</h2>
          <Separator className="my-4" />
          {analytics.teamPerformance.length > 0 ? (
            <div className="space-y-4">
              {analytics.teamPerformance.map((member, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-medium flex-shrink-0">
                    {member.name.charAt(0).toUpperCase()}
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
                      className="h-full bg-orange-600 rounded-full"
                      style={{ width: `${member.efficiency}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No team performance data available yet</p>
              <p className="text-sm mt-1">Assign and complete tasks to see team performance metrics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalyticsPage;

