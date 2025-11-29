"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
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
  Loader2,
  FolderKanban,
  CheckSquare,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import PageHeader from "@/components/common/PageHeader";
import { Separator } from "@/components/ui/separator";
import ActivityFeed from "@/components/common/ActivityFeed";
import StatCard from "@/components/common/StatCard";
import DetailsCard from "@/components/common/DetailsCard";
import { useProjects } from "@/hooks/useProjects";
import taskService from "@/services/taskService";
import { Task, TaskStatus } from "@/types/project";

const AnalyticsPage = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  
  const { 
    projects = [], 
    loading: projectsLoading, 
    stats = { total: 0, active: 0, completed: 0, planning: 0 }
  } = useProjects();
  
  const [allTasks, setAllTasks] = useState<Task[]>([]);
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

  // Calculate metrics from real data
  const metrics = useMemo(() => {
    const completedTasks = allTasks.filter(t => t.status === TaskStatus.Completed).length;
    const inProgressTasks = allTasks.filter(t => t.status === TaskStatus.Active).length;
    const createdTasks = allTasks.filter(t => t.status === TaskStatus.Created).length;
    const backlogTasks = allTasks.filter(t => t.status === TaskStatus.Backlog).length;
    
    // Calculate team members count
    const uniqueMembers = new Set();
    projects.forEach(project => {
      project.team?.members?.forEach((member: any) => {
        uniqueMembers.add(member.user?.id || member.id);
      });
    });
    
    // Calculate average completion time (simplified)
    const completedTasksWithDates = allTasks.filter(t => 
      t.status === TaskStatus.Completed && t.created_at && t.updated_at
    );
    let avgCompletionDays = 0;
    if (completedTasksWithDates.length > 0) {
      const totalDays = completedTasksWithDates.reduce((sum, task) => {
        const created = new Date(task.created_at);
        const completed = new Date(task.updated_at);
        const days = Math.floor((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      avgCompletionDays = Math.round(totalDays / completedTasksWithDates.length * 10) / 10;
    }
    
    // Calculate productivity score
    const productivityScore = allTasks.length > 0 
      ? Math.round((completedTasks / allTasks.length) * 100)
      : 0;
    
    return {
      totalProjects: stats.total,
      activeProjects: stats.active,
      completedProjects: stats.completed,
      planningProjects: stats.planning,
      totalTasks: allTasks.length,
      completedTasks,
      inProgressTasks,
      createdTasks,
      backlogTasks,
      teamMembers: uniqueMembers.size,
      averageCompletionTime: avgCompletionDays > 0 ? `${avgCompletionDays} days` : "N/A",
      productivityScore,
    };
  }, [allTasks, projects, stats]);

  // Calculate chart data (last 6 months)
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      
      const created = allTasks.filter(t => {
        const taskDate = new Date(t.created_at);
        return taskDate.getMonth() === date.getMonth() && 
               taskDate.getFullYear() === date.getFullYear();
      }).length;
      
      const completed = allTasks.filter(t => {
        if (t.status !== TaskStatus.Completed) return false;
        const taskDate = new Date(t.updated_at || t.created_at);
        return taskDate.getMonth() === date.getMonth() && 
               taskDate.getFullYear() === date.getFullYear();
      }).length;
      
      data.push({ month: monthName, completed, created });
    }
    
    return data;
  }, [allTasks]);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    // Calculate velocity (tasks completed per week)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const tasksThisWeek = allTasks.filter(t => {
      if (t.status !== TaskStatus.Completed) return false;
      const completedDate = new Date(t.updated_at || t.created_at);
      return completedDate >= oneWeekAgo;
    }).length;

    // Calculate completion rate
    const completionRate = allTasks.length > 0 
      ? Math.round((metrics.completedTasks / allTasks.length) * 100)
      : 0;

    return {
      velocity: tasksThisWeek,
      completionRate,
    };
  }, [allTasks, metrics.completedTasks]);

  // Calculate team performance
  const teamPerformance = useMemo(() => {
    const memberStats = new Map();
    
    projects.forEach(project => {
      project.team?.members?.forEach((member: any) => {
        const userId = member.user?.id || member.id;
        const userName = member.user?.first_name && member.user?.last_name
          ? `${member.user.first_name} ${member.user.last_name}`
          : member.user?.email?.split('@')[0] || 'Unknown';
        
        if (!memberStats.has(userId)) {
          memberStats.set(userId, {
            id: userId,
            name: userName,
            completedTasks: 0,
            totalTasks: 0,
          });
        }
      });
    });

    // Count tasks for each member
    allTasks.forEach(task => {
      if (task.assigned_to && Array.isArray(task.assigned_to)) {
        task.assigned_to.forEach((assignee: any) => {
          const userId = typeof assignee === 'object' ? assignee.id : assignee;
          const stats = memberStats.get(userId);
          if (stats) {
            stats.totalTasks++;
            if (task.status === TaskStatus.Completed) {
              stats.completedTasks++;
            }
          }
        });
      }
    });

    // Convert to array and calculate performance percentage
    return Array.from(memberStats.values())
      .filter(member => member.totalTasks > 0)
      .map(member => ({
        ...member,
        performance: member.totalTasks > 0 
          ? Math.round((member.completedTasks / member.totalTasks) * 100)
          : 0,
      }))
      .sort((a, b) => b.completedTasks - a.completedTasks)
      .slice(0, 10); // Top 10 performers
  }, [allTasks, projects]);

  // Export report function
  const exportReport = (type: string) => {
    let csvContent = '';
    let filename = '';

    if (type === 'projects') {
      filename = 'projects-report.csv';
      csvContent = 'Project Name,Status,Progress,Tasks,Completed Tasks\n';
      projects.forEach(project => {
        csvContent += `"${project.name}","${project.status || 'active'}",${project.progress || 0},${project.tasks || 0},${project.completedTasks || 0}\n`;
      });
    } else if (type === 'tasks') {
      filename = 'tasks-report.csv';
      csvContent = 'Task Name,Status,Priority,Created Date,Project\n';
      allTasks.forEach(task => {
        const project = projects.find(p => p.id.toString() === task.Project);
        csvContent += `"${task.name}","${task.status}","${task.priority}","${new Date(task.created_at).toLocaleDateString()}","${project?.name || 'Unknown'}"\n`;
      });
    } else if (type === 'team') {
      filename = 'team-performance-report.csv';
      csvContent = 'Team Member,Completed Tasks,Total Tasks,Performance\n';
      teamPerformance.forEach(member => {
        csvContent += `"${member.name}",${member.completedTasks},${member.totalTasks},${member.performance}%\n`;
      });
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loading = projectsLoading || tasksLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Analytics"
          description="Track performance and productivity metrics across your projects"
          icon={BarChart3}
          tabs={[
            { icon: BarChart3, label: "Overview", href: "/analytics" },
            { icon: Activity, label: "Performance", href: "/analytics?tab=performance" },
            { icon: FileText, label: "Reports", href: "/analytics?tab=reports" },
          ]}
        />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

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
                          {metrics.productivityScore}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-600 rounded-full transition-all"
                          style={{ width: `${metrics.productivityScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                      <StatCard
                        icon={CheckCircle2}
                        value={metrics.completedTasks}
                        label="Completed"
                        className="p-0 border-0 shadow-none bg-transparent"
                        iconBgColor="bg-green-100"
                        iconColor="text-green-600"
                      />
                      <StatCard
                        icon={Clock}
                        value={metrics.inProgressTasks}
                        label="In Progress"
                        className="p-0 border-0 shadow-none bg-transparent"
                        iconBgColor="bg-orange-100"
                        iconColor="text-orange-600"
                      />
                      <StatCard
                        icon={Users}
                        value={metrics.teamMembers}
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
                    value={metrics.completedTasks}
                    label="Tasks Completed"
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                  />
                  <StatCard
                    icon={Clock}
                    value={metrics.averageCompletionTime}
                    label="Avg. Completion Time"
                    iconBgColor="bg-orange-100"
                    iconColor="text-orange-600"
                  />
                  <StatCard
                    icon={Users}
                    value={metrics.teamMembers}
                    label="Team Members"
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                  />
                  <StatCard
                    icon={TrendingUp}
                    value={`${metrics.productivityScore}%`}
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
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="month" 
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
                          <Legend 
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="line"
                          />
                          <Line
                            type="monotone"
                            dataKey="created"
                            stroke="#9ca3af"
                            strokeWidth={2}
                            name="Created Tasks"
                            dot={{ fill: '#9ca3af', r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="completed"
                            stroke="#ea580c"
                            strokeWidth={2}
                            name="Completed Tasks"
                            dot={{ fill: '#ea580c', r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
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
                            {metrics.activeProjects}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{
                              width: `${
                                metrics.totalProjects > 0
                                  ? (metrics.activeProjects / metrics.totalProjects) * 100
                                  : 0
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
                            {metrics.completedProjects}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-600 rounded-full"
                            style={{
                              width: `${
                                metrics.totalProjects > 0
                                  ? (metrics.completedProjects / metrics.totalProjects) * 100
                                  : 0
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
                            {metrics.planningProjects}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-300 rounded-full"
                            style={{
                              width: `${
                                metrics.totalProjects > 0
                                  ? (metrics.planningProjects / metrics.totalProjects) * 100
                                  : 0
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
                    {metrics.totalTasks > 0 ? (
                      <>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Completed', value: metrics.completedTasks, color: '#22c55e' },
                                  { name: 'In Progress', value: metrics.inProgressTasks, color: '#ea580c' },
                                  { name: 'Created', value: metrics.createdTasks, color: '#3b82f6' },
                                  { name: 'Backlog', value: metrics.backlogTasks, color: '#9ca3af' },
                                ].filter(item => item.value > 0)}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {[
                                  { name: 'Completed', value: metrics.completedTasks, color: '#22c55e' },
                                  { name: 'In Progress', value: metrics.inProgressTasks, color: '#ea580c' },
                                  { name: 'Created', value: metrics.createdTasks, color: '#3b82f6' },
                                  { name: 'Backlog', value: metrics.backlogTasks, color: '#9ca3af' },
                                ].filter(item => item.value > 0).map((entry, index) => (
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
                              <Legend 
                                verticalAlign="bottom" 
                                height={36}
                                iconType="circle"
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-900">Completed</span>
                            <span className="text-lg font-semibold text-green-600">{metrics.completedTasks}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-900">In Progress</span>
                            <span className="text-lg font-semibold text-orange-600">{metrics.inProgressTasks}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-900">Created</span>
                            <span className="text-lg font-semibold text-blue-600">{metrics.createdTasks}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-900">Backlog</span>
                            <span className="text-lg font-semibold text-gray-600">{metrics.backlogTasks}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No tasks available</p>
                      </div>
                    )}
                  </div>

                  {/* Team Performance */}
                  <div className="pm-card p-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Team Performance
                    </h2>
                    <Separator className="my-4" />
                    {teamPerformance.length > 0 ? (
                      <div className="space-y-4">
                        {teamPerformance.slice(0, 5).map((member) => (
                          <div key={member.id} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-900">
                                {member.name}
                              </span>
                              <span className="text-gray-600">
                                {member.completedTasks}/{member.totalTasks} ({member.performance}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-600 rounded-full transition-all"
                                style={{ width: `${member.performance}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No team performance data available</p>
                        <p className="text-xs mt-2">Assign tasks to team members to see performance metrics</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Performance Tab */}
            {tab === "performance" && (
              <div className="space-y-6">
                <div className="pm-card p-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Performance Metrics
                  </h2>
                  <Separator className="my-4" />
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <StatCard
                        icon={TrendingUp}
                        value={performanceMetrics.velocity}
                        label="Velocity (Tasks/week)"
                        iconBgColor="bg-blue-100"
                        iconColor="text-blue-600"
                      />
                      <StatCard
                        icon={Activity}
                        value={`${performanceMetrics.completionRate}%`}
                        label="Completion Rate"
                        iconBgColor="bg-green-100"
                        iconColor="text-green-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Team Performance */}
                <div className="pm-card p-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Team Performance
                  </h2>
                  <Separator className="my-4" />
                  {teamPerformance.length > 0 ? (
                    <div className="space-y-4">
                      {teamPerformance.map((member) => (
                        <div key={member.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-900">
                              {member.name}
                            </span>
                            <span className="text-gray-600">
                              {member.completedTasks} tasks
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-600 rounded-full transition-all"
                              style={{ width: `${member.performance}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No team performance data available</p>
                    </div>
                  )}
                </div>

                {/* Task Distribution Chart */}
                <div className="pm-card p-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Task Status Distribution
                  </h2>
                  <Separator className="my-4" />
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="month" 
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
                        />
                        <Legend iconType="line" />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          stroke="#22c55e"
                          strokeWidth={2}
                          name="Completed"
                          dot={{ fill: '#22c55e', r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {tab === "reports" && (
              <div className="space-y-6">
                <div className="pm-card p-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Analytics Summary
                  </h2>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard
                      icon={FolderKanban}
                      value={metrics.totalProjects}
                      label="Total Projects"
                      iconBgColor="bg-blue-100"
                      iconColor="text-blue-600"
                    />
                    <StatCard
                      icon={CheckSquare}
                      value={metrics.totalTasks}
                      label="Total Tasks"
                      iconBgColor="bg-gray-100"
                      iconColor="text-gray-700"
                    />
                    <StatCard
                      icon={CheckCircle2}
                      value={metrics.completedTasks}
                      label="Completed Tasks"
                      iconBgColor="bg-green-100"
                      iconColor="text-green-600"
                    />
                    <StatCard
                      icon={Users}
                      value={metrics.teamMembers}
                      label="Team Members"
                      iconBgColor="bg-purple-100"
                      iconColor="text-purple-600"
                    />
                  </div>
                </div>

                <div className="pm-card p-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Export Data
                  </h2>
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">
                          Project Summary Report
                        </p>
                        <p className="text-sm text-gray-500">
                          Overview of all projects and their status
                        </p>
                      </div>
                      <button 
                        onClick={() => exportReport('projects')}
                        className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Export CSV
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">
                          Task Analytics Report
                        </p>
                        <p className="text-sm text-gray-500">
                          Detailed task completion and performance data
                        </p>
                      </div>
                      <button 
                        onClick={() => exportReport('tasks')}
                        className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Export CSV
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">
                          Team Performance Report
                        </p>
                        <p className="text-sm text-gray-500">
                          Individual team member contributions
                        </p>
                      </div>
                      <button 
                        onClick={() => exportReport('team')}
                        className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Analytics Details */}
            <DetailsCard
              title="Analytics Details"
              items={[
                {
                  icon: FolderKanban,
                  label: "Total Projects",
                  value: metrics.totalProjects,
                  iconBgColor: "bg-blue-100",
                  iconColor: "text-blue-600",
                },
                {
                  icon: TrendingUp,
                  label: "Active Projects",
                  value: metrics.activeProjects,
                  iconBgColor: "bg-orange-100",
                  iconColor: "text-orange-600",
                },
                {
                  icon: CheckSquare,
                  label: "Total Tasks",
                  value: metrics.totalTasks,
                  iconBgColor: "bg-green-100",
                  iconColor: "text-green-600",
                },
                {
                  icon: Users,
                  label: "Team Members",
                  value: metrics.teamMembers,
                  iconBgColor: "bg-purple-100",
                  iconColor: "text-purple-600",
                },
              ]}
            />

            {/* Recent Activity */}
            <ActivityFeed limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
