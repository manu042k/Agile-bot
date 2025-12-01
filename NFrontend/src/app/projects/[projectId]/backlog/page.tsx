"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, Search, Filter, Calendar, User, Flag, Loader2, ArrowLeft, Check } from "lucide-react";
import ProjectHeader from "@/components/projects/ProjectHeader";
import taskService from "@/services/taskService";
import sprintService from "@/services/sprintService";
import { Task, TaskStatus, TaskPriority, Sprint } from "@/types/project";
import { getPriorityClass } from "@/lib/colorUtils";
import toast from "react-hot-toast";

const SprintBacklogPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.projectId as string;
  const sprintId = searchParams.get("sprint");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, [projectId, sprintId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, sprintsData] = await Promise.all([
        taskService.getTasks(projectId),
        sprintService.getSprints(projectId),
      ]);

      // Filter tasks that are NOT assigned to any sprint
      const unassignedTasks = tasksData.filter(task => !task.sprint);
      setTasks(unassignedTasks);
      setSprints(sprintsData);

      if (sprintId) {
        const selectedSprint = sprintsData.find(s => s.id.toString() === sprintId);
        setSprint(selectedSprint || null);
      }
    } catch (err: any) {
      console.error("Error fetching backlog:", err);
      toast.error("Failed to load backlog");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToSprint = async () => {
    if (!sprint || selectedTasks.size === 0) {
      toast.error("Please select a sprint and at least one task");
      return;
    }

    try {
      // Update tasks to assign them to sprint
      const updatePromises = Array.from(selectedTasks).map(taskId =>
        taskService.updateTask(taskId, { sprint: sprint.id })
      );

      await Promise.all(updatePromises);
      toast.success(`${selectedTasks.size} task(s) assigned to sprint`);
      setSelectedTasks(new Set());
      fetchData();
    } catch (err: any) {
      console.error("Error assigning tasks:", err);
      toast.error("Failed to assign tasks to sprint");
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const filteredTasks = tasks.filter(task =>
    task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/projects/${projectId}/timeline`)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Back to Timeline"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">Sprint Backlog</h1>
                <p className="text-gray-600">Assign unassigned tasks to sprints</p>
              </div>
            </div>
          </div>

          {/* Sprint Selector and Actions */}
          <div className="flex items-center gap-4 mb-4">
            <select
              value={sprintId || ""}
              onChange={(e) => {
                if (e.target.value) {
                  router.push(`/projects/${projectId}/backlog?sprint=${e.target.value}`);
                } else {
                  router.push(`/projects/${projectId}/backlog`);
                }
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select a sprint...</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>

            {sprint && selectedTasks.size > 0 && (
              <button
                onClick={handleAssignToSprint}
                className="pm-button-primary"
              >
                Assign {selectedTasks.size} Task(s) to {sprint.name}
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="pm-card p-12 text-center">
            <p className="text-gray-600 mb-2">
              {searchQuery ? "No tasks match your search" : "No unassigned tasks"}
            </p>
            {!searchQuery && (
              <p className="text-sm text-gray-500">All tasks are assigned to sprints</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.taskid}
                className={`pm-card p-4 cursor-pointer transition-all ${
                  selectedTasks.has(task.taskid) ? "ring-2 ring-orange-500 bg-orange-50" : ""
                }`}
                onClick={() => toggleTaskSelection(task.taskid)}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedTasks.has(task.taskid)
                          ? "bg-orange-600 border-orange-600"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedTasks.has(task.taskid) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{task.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityClass(task.priority)}`}>
                        <Flag className="h-3 w-3 inline mr-1" />
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {task.assigned_to && Array.isArray(task.assigned_to) && task.assigned_to.length > 0 && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{typeof task.assigned_to[0] === 'object' && 'email' in task.assigned_to[0] ? (task.assigned_to[0].username || task.assigned_to[0].email) : 'Assigned'}</span>
                        </div>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        task.status === TaskStatus.Completed ? "bg-green-100 text-green-800" :
                        task.status === TaskStatus.Active ? "bg-blue-100 text-blue-800" :
                        task.status === TaskStatus.Created ? "bg-gray-100 text-gray-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SprintBacklogPage;

