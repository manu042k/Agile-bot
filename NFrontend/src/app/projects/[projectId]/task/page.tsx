"use client";
import { useState, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import TaskCreateComponent from "@/components/projects/TaskCreateComponent";
import { getStatusColumnColor } from "@/lib/colorUtils";
import { getStatusLabel } from "@/lib/statusUtils";
import CreateCard from "@/components/common/CreateCard";
import TaskCard from "@/components/projects/TaskCard";
import ProjectHeader from "@/components/projects/ProjectHeader";
import taskService from "@/services/taskService";
import { Task, TaskStatus } from "@/types/project";
import { Loader2 } from "lucide-react";

const TaskPage = ({ params }: { params: { projectId: string } }) => {
  const projectId = params.projectId;
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const fetchedTasks = await taskService.getTasks(projectId);
        setTasks(fetchedTasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const columns = [
    { id: TaskStatus.Backlog, title: getStatusLabel(TaskStatus.Backlog), color: getStatusColumnColor("backlog") },
    { id: TaskStatus.Created, title: getStatusLabel(TaskStatus.Created), color: getStatusColumnColor("todo") },
    { id: TaskStatus.Active, title: getStatusLabel(TaskStatus.Active), color: getStatusColumnColor("in_progress") },
    { id: TaskStatus.Completed, title: getStatusLabel(TaskStatus.Completed), color: getStatusColumnColor("done") },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      task.name?.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower) ||
      task.details?.toLowerCase().includes(searchLower) ||
      task.task_number?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader />
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Tasks</h1>
              <p className="text-gray-600">Manage and track project tasks</p>
            </div>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <CreateCard
                    title="New Task"
                    description="Create task"
                    icon={Plus}
                  />
                </DialogTrigger>
                <TaskCreateComponent projectId={projectId} onClose={() => {}} />
              </Dialog>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              />
            </div>
            <button className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </button>
        </div>
      </div>

      {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => {
            const columnTasks = filteredTasks.filter((task) => task.status === column.id);
            return (
              <div key={column.id} className="flex flex-col">
                {/* Column Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${column.color}`} />
                      <h3 className="font-semibold text-gray-900">{column.title}</h3>
                    </div>
                    <span className="pm-badge bg-gray-100 text-gray-700 border-gray-200">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-3 flex-1 min-h-0">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.taskid}
                      task={task}
                      projectId={projectId}
                      compact={true}
                    />
                  ))}

                  {/* Add Task Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="pm-card p-3 text-center text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all border-dashed w-full">
                    <Plus className="h-4 w-4 mx-auto mb-1" />
                    Add task
                  </button>
                    </DialogTrigger>
                    <TaskCreateComponent projectId={projectId} onClose={() => {}} />
                  </Dialog>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
