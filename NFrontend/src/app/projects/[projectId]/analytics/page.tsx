"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { TrendingUp, CheckCircle2, Clock, Users, Calendar, ArrowUp, ArrowDown, Loader2, BarChart3 } from "lucide-react";
import ProjectHeader from "@/components/projects/ProjectHeader";
import SprintBurndownChart from "@/components/projects/SprintBurndownChart";
import { Separator } from "@/components/ui/separator";
import StatCard from "@/components/common/StatCard";
import projectService from "@/services/projectService";
import taskService from "@/services/taskService";
import sprintService from "@/services/sprintService";
import { Project, Task, TaskStatus, Sprint, SprintStatus } from "@/types/project";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ProjectAnalyticsPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.projectId as string;
  const sprintId = searchParams.get("sprint");
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectData, tasksData, sprintsData] = await Promise.all([
          projectService.getProject(projectId),
          taskService.getTasks(projectId),
          sprintService.getSprints(projectId),
        ]);
        setProject(projectData);
        setTasks(tasksData);
        setSprints(sprintsData);
        
        // Set selected sprint if sprintId is provided
        if (sprintId) {
          const sprint = sprintsData.find(s => s.id.toString() === sprintId);
          setSelectedSprint(sprint || null);
        } else {
          // Default to active sprint if available
          const activeSprint = sprintsData.find(s => 
            s.status === SprintStatus.Active || 
            (s.auto_status && s.auto_status === SprintStatus.Active)
          );
          setSelectedSprint(activeSprint || null);
        }
        
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
  }, [projectId, sprintId]);

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

        {/* Sprint Burndown Chart */}
        {sprints.length > 0 && (
          <div className="mb-6">
            {selectedSprint ? (
              <div className="pm-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Sprint Burndown</h2>
                  <select
                    value={selectedSprint?.id.toString() || ""}
                    onChange={(e) => {
                      const sprint = sprints.find(s => s.id.toString() === e.target.value);
                      setSelectedSprint(sprint || null);
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  >
                    {sprints.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.status})
                      </option>
                    ))}
                  </select>
                </div>
                <SprintBurndownChart 
                  sprint={selectedSprint} 
                  tasks={tasks.filter(t => t.sprint && t.sprint.toString() === selectedSprint.id.toString())}
                />
              </div>
            ) : (
              <div className="pm-card p-12 text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">No sprint selected</p>
                <p className="text-sm text-gray-500">Select a sprint to view its burndown chart</p>
              </div>
            )}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={CheckCircle2}
            value={`${analytics.overview.completionRate}%`}
            label="Completion Rate"
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            icon={TrendingUp}
            value={analytics.overview.totalTasks}
            label="Total Tasks"
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={Clock}
            value={analytics.overview.avgTaskCompletion.toFixed(1)}
            label="Avg Days/Task"
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
          <StatCard
            icon={Users}
            value={project?.team?.members?.length || 0}
            label="Team Members"
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
          </div>

          {/* Task Completion Trend */}
        <div className="pm-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Task Completion Trend (Last 5 Weeks)</h2>
            <Separator className="my-4" />
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.taskCompletion}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="week" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                    labelStyle={{ color: '#111827', fontWeight: 600 }}
                  />
                  <Legend />
                  <Bar
                    dataKey="completed"
                    fill="#ea580c"
                    name="Tasks Completed"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="pm-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h2>
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donut Chart */}
            <div className="flex items-center justify-center">
              <div className="relative h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: analytics.statusDistribution.completed, color: '#22c55e' },
                        { name: 'Active', value: analytics.statusDistribution.active, color: '#3b82f6' },
                        { name: 'Created', value: analytics.statusDistribution.created, color: '#eab308' },
                        { name: 'Backlog', value: analytics.statusDistribution.backlog, color: '#6b7280' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {[
                        { name: 'Completed', value: analytics.statusDistribution.completed, color: '#22c55e' },
                        { name: 'Active', value: analytics.statusDistribution.active, color: '#3b82f6' },
                        { name: 'Created', value: analytics.statusDistribution.created, color: '#eab308' },
                        { name: 'Backlog', value: analytics.statusDistribution.backlog, color: '#6b7280' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px 12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-4xl font-bold text-gray-900">{analytics.overview.totalTasks}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Tasks</p>
                </div>
              </div>
            </div>

            {/* Legend with Stats */}
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-center justify-between p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Completed</p>
                    <p className="text-xs text-gray-600">Tasks finished</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{analytics.statusDistribution.completed}</p>
                  <p className="text-xs text-gray-500">
                    {analytics.overview.totalTasks > 0 
                      ? Math.round((analytics.statusDistribution.completed / analytics.overview.totalTasks) * 100)
                      : 0}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Active</p>
                    <p className="text-xs text-gray-600">In progress</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{analytics.statusDistribution.active}</p>
                  <p className="text-xs text-gray-500">
                    {analytics.overview.totalTasks > 0 
                      ? Math.round((analytics.statusDistribution.active / analytics.overview.totalTasks) * 100)
                      : 0}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Created</p>
                    <p className="text-xs text-gray-600">Ready to start</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-600">{analytics.statusDistribution.created}</p>
                  <p className="text-xs text-gray-500">
                    {analytics.overview.totalTasks > 0 
                      ? Math.round((analytics.statusDistribution.created / analytics.overview.totalTasks) * 100)
                      : 0}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border-l-4 border-gray-500 bg-gray-50 rounded-r-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Backlog</p>
                    <p className="text-xs text-gray-600">Not started</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-600">{analytics.statusDistribution.backlog}</p>
                  <p className="text-xs text-gray-500">
                    {analytics.overview.totalTasks > 0 
                      ? Math.round((analytics.statusDistribution.backlog / analytics.overview.totalTasks) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="pm-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500">This Week</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {tasks.filter(t => {
                const created = new Date(t.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return created >= weekAgo;
              }).length}
            </p>
            <p className="text-sm text-gray-600">Tasks Created</p>
            <div className="mt-3 flex items-center text-xs">
              <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">Active</span>
            </div>
          </div>

          <div className="pm-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs text-gray-500">Team</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {project?.team?.members?.length || 0}
            </p>
            <p className="text-sm text-gray-600">Active Members</p>
            <div className="mt-3 flex items-center text-xs">
              <span className="text-purple-600 font-medium">Collaborating</span>
            </div>
          </div>

          <div className="pm-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-orange-100">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs text-gray-500">Average</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {analytics.overview.avgTaskCompletion > 0 
                ? analytics.overview.avgTaskCompletion.toFixed(1)
                : 'N/A'}
            </p>
            <p className="text-sm text-gray-600">Days per Task</p>
            <div className="mt-3 flex items-center text-xs">
              <span className="text-orange-600 font-medium">Completion Time</span>
            </div>
          </div>
        </div>

        {/* Task Activity Timeline */}
        <div className="pm-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Task Activity by Status</h2>
          <Separator className="my-4" />
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700">Completed</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{analytics.statusDistribution.completed}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ 
                    width: `${analytics.overview.totalTasks > 0 
                      ? (analytics.statusDistribution.completed / analytics.overview.totalTasks) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{analytics.statusDistribution.active}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ 
                    width: `${analytics.overview.totalTasks > 0 
                      ? (analytics.statusDistribution.active / analytics.overview.totalTasks) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium text-gray-700">Created</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{analytics.statusDistribution.created}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all"
                  style={{ 
                    width: `${analytics.overview.totalTasks > 0 
                      ? (analytics.statusDistribution.created / analytics.overview.totalTasks) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-sm font-medium text-gray-700">Backlog</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{analytics.statusDistribution.backlog}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-500 rounded-full transition-all"
                  style={{ 
                    width: `${analytics.overview.totalTasks > 0 
                      ? (analytics.statusDistribution.backlog / analytics.overview.totalTasks) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Team Members List */}
          <div className="pm-card p-6">
            <h2 className="text-lg font-semibold text-gray-900">Team Performance</h2>
            <Separator className="my-4" />
            {analytics.teamPerformance.length > 0 ? (
              <div className="space-y-3">
                {analytics.teamPerformance.slice(0, 5).map((member, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      {idx < 3 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600">
                          <span className="font-medium text-green-600">{member.tasksCompleted}</span> completed
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{member.avgTime}</span>
                      </div>
                      <div className="mt-2 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all"
                          style={{ width: `${member.efficiency}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{member.efficiency}%</p>
                      <p className="text-xs text-gray-500">Efficiency</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="font-medium">No team performance data</p>
                <p className="text-sm mt-1">Assign and complete tasks to see metrics</p>
              </div>
            )}
          </div>

          {/* Performance Comparison Chart */}
          <div className="pm-card p-6">
            <h2 className="text-lg font-semibold text-gray-900">Tasks Completed Comparison</h2>
            <Separator className="my-4" />
            {analytics.teamPerformance.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.teamPerformance.slice(0, 5)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      type="number"
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px 12px',
                      }}
                      cursor={{ fill: 'rgba(234, 88, 12, 0.1)' }}
                    />
                    <Bar
                      dataKey="tasksCompleted"
                      fill="#ea580c"
                      name="Tasks Completed"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="font-medium">No comparison data</p>
                <p className="text-sm mt-1">Complete tasks to see comparison</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalyticsPage;

