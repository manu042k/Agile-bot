"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Calendar, Clock, User, Flag, Loader2 } from "lucide-react";
import ProjectHeader from "@/components/projects/ProjectHeader";
import { Separator } from "@/components/ui/separator";
import projectService from "@/services/projectService";
import taskService from "@/services/taskService";
import { Project, Task, TaskStatus } from "@/types/project";
import toast from "react-hot-toast";

const TimelinePage = () => {
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
        console.error("Error fetching timeline data:", err);
        setError(err.message || "Failed to fetch timeline data");
        toast.error("Failed to load timeline");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const getDaysBetween = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.Completed:
        return "bg-gray-800 text-white";
      case TaskStatus.Active:
      case TaskStatus.Created:
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading timeline...</p>
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
            <p className="text-red-600 font-medium mb-2">Failed to load timeline</p>
            <p className="text-sm text-red-500">{error || "Project not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate project timeline from tasks
  const projectCreated = new Date(project.created_at);
  const now = new Date();
  
  // Get earliest task start and latest task end (using created_at and updated_at)
  let startDate = projectCreated;
  if (tasks.length > 0) {
    const validTaskDates = tasks
      .map(task => new Date(task.created_at))
      .filter(date => !isNaN(date.getTime()));
    
    if (validTaskDates.length > 0) {
      const earliestDate = new Date(Math.min(...validTaskDates.map(d => d.getTime())));
      if (!isNaN(earliestDate.getTime())) {
        startDate = earliestDate;
      }
    }
  }
  const endDate = now;
  
  const totalDays = Math.max(1, getDaysBetween(startDate.toISOString(), endDate.toISOString()));

  // Group tasks by status
  const completedTasks = tasks.filter(t => t.status === TaskStatus.Completed);
  const activeTasks = tasks.filter(t => t.status === TaskStatus.Active || t.status === TaskStatus.Created);
  const backlogTasks = tasks.filter(t => t.status === TaskStatus.Backlog);

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
                {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-semibold text-gray-900">{totalDays}</p>
                <p className="text-xs text-gray-500">Days Active</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-600 rounded-full transition-all"
              style={{ 
                width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%` 
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
            <span>{completedTasks.length} of {tasks.length} tasks completed</span>
            <span>{tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%</span>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="pm-card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Completed</p>
              <Flag className="h-4 w-4 text-gray-600" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{completedTasks.length}</p>
            <p className="text-xs text-gray-500 mt-1">Tasks finished</p>
          </div>
          <div className="pm-card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">In Progress</p>
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{activeTasks.length}</p>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </div>
          <div className="pm-card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Backlog</p>
              <Calendar className="h-4 w-4 text-gray-600" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{backlogTasks.length}</p>
            <p className="text-xs text-gray-500 mt-1">Pending tasks</p>
          </div>
        </div>

        {/* Task List */}
        <div className="pm-card p-6">
          <h2 className="text-lg font-semibold text-gray-900">All Tasks</h2>
          <Separator className="my-4" />
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => {
                const assignees = Array.isArray(task.assigned_to) 
                  ? task.assigned_to.map((a: any) => a.email || a).join(", ")
                  : "Unassigned";

                return (
                  <div key={task.taskid} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{task.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {assignees}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created {new Date(task.created_at).toLocaleDateString()}
                        </span>
                        {task.priority && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                            task.priority === "high" ? "bg-red-50 text-red-800 border-red-300" :
                            task.priority === "medium" ? "bg-yellow-50 text-yellow-800 border-yellow-300" :
                            "bg-gray-50 text-gray-800 border-gray-300"
                          }`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">No tasks yet</p>
              <p className="text-sm text-gray-500">Create tasks to see them on the timeline</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;

