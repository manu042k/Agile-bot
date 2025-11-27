"use client";
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ProjectHeader from "@/components/projects/ProjectHeader";
import { Plus, User, Flag, Calendar, MoreVertical, GripVertical, Loader2, ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { getStatusColumnColor, getPriorityClass } from "@/lib/colorUtils";
import taskService from "@/services/taskService";
import sprintService from "@/services/sprintService";
import { Task as APITask, TaskStatus, TaskPriority, Sprint } from "@/types/project";
import toast from "react-hot-toast";

interface Task {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: "low" | "normal" | "high";
  status: "backlog" | "created" | "active" | "completed";
  description: string;
}

interface Column {
  id: string;
  title: string;
  status: Task["status"];
  color: string;
}

const columns: Column[] = [
  { id: "backlog", title: "Backlog", status: "backlog", color: getStatusColumnColor("backlog") },
  { id: "created", title: "To Do", status: "created", color: getStatusColumnColor("todo") },
  { id: "active", title: "In Progress", status: "active", color: getStatusColumnColor("in_progress") },
  { id: "completed", title: "Done", status: "completed", color: getStatusColumnColor("done") },
];

function TaskCard({ task, projectId }: { task: Task; projectId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id.toString(),
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };


  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border border-gray-200 p-4 mb-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <Link href={`/projects/${projectId}/task/${task.id}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 hover:text-gray-700">
              {task.title}
            </h3>
          </Link>
        </div>
        <button className="p-1 rounded hover:bg-gray-100 transition-colors">
          <MoreVertical className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <User className="h-3 w-3" />
            <span className="truncate max-w-[80px]">{task.assignee}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityClass(task.priority)}`}>
          <Flag className="h-3 w-3 inline mr-1" />
          {task.priority}
        </span>
      </div>
    </div>
  );
}

function DroppableColumn({ column, tasks, projectId }: { column: Column; tasks: Task[]; projectId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  const columnTasks = tasks.filter((task) => task.status === column.status);

  return (
    <div className="flex-1 min-w-[280px] max-w-[320px]">
      <div
        ref={setNodeRef}
        className={`bg-white rounded-lg border-2 p-4 h-full flex flex-col transition-colors ${
          isOver ? "border-gray-900 bg-gray-50" : "border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${column.color}`} />
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {columnTasks.length}
            </span>
          </div>
          <button className="p-1 rounded hover:bg-gray-100 transition-colors">
            <Plus className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <SortableContext items={columnTasks.map((t) => t.id.toString())} strategy={verticalListSortingStrategy}>
          <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[calc(100vh-300px)]">
            {columnTasks.length > 0 ? (
              columnTasks.map((task) => <TaskCard key={task.id} task={task} projectId={projectId} />)
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                <p>Drop tasks here</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

const BoardPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const sprintId = searchParams.get("sprint");
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const convertAPITaskToTask = (apiTask: APITask): Task => {
    const getAssigneeNames = () => {
      if (!apiTask.assigned_to || !Array.isArray(apiTask.assigned_to)) return "Unassigned";
      if (apiTask.assigned_to.length === 0) return "Unassigned";
      return apiTask.assigned_to.map((u: any) => u?.email?.split('@')[0] || "Unknown").join(", ");
    };

    const statusMap: Record<string, Task["status"]> = {
      [TaskStatus.Backlog]: "backlog",
      [TaskStatus.Created]: "created",
      [TaskStatus.Active]: "active",
      [TaskStatus.Completed]: "completed",
    };

    const priorityMap: Record<string, Task["priority"]> = {
      [TaskPriority.Low]: "low",
      [TaskPriority.Normal]: "normal",
      [TaskPriority.High]: "high",
    };

    return {
      id: apiTask.taskid,
      title: apiTask.name,
      assignee: getAssigneeNames(),
      dueDate: new Date(apiTask.created_at).toLocaleDateString(),
      priority: priorityMap[apiTask.priority] || "normal",
      status: statusMap[apiTask.status] || "created",
      description: apiTask.description || apiTask.details || "",
    };
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await taskService.getTasks(projectId);
      
      // Filter by sprint if sprintId is provided
      let filteredTasks = fetchedTasks;
      if (sprintId) {
        filteredTasks = fetchedTasks.filter((task: APITask) => 
          task.sprint && task.sprint.toString() === sprintId
        );
      }
      
      const convertedTasks = filteredTasks.map(convertAPITaskToTask);
      setTasks(convertedTasks);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchSprint = async () => {
    if (!sprintId) return;
    
    try {
      const sprintData = await sprintService.getSprint(projectId, sprintId);
      setSprint(sprintData);
    } catch (err: any) {
      console.error("Error fetching sprint:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (sprintId) {
      fetchSprint();
    }
  }, [projectId, sprintId]);

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = tasks.find((t) => t.id.toString() === taskId);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const column = columns.find((col) => col.id === overId);
    let newStatus: Task["status"] | null = null;

    if (column) {
      newStatus = column.status;
    } else {
      // Check if dropped on another task (find the column of that task)
      const overTask = tasks.find((t) => t.id.toString() === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (!newStatus) return;

    // Optimistically update the UI
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id.toString() === taskId ? { ...task, status: newStatus! } : task
      )
    );

    // Update the task status in the backend
    try {
      const apiStatusMap: Record<Task["status"], TaskStatus> = {
        backlog: TaskStatus.Backlog,
        created: TaskStatus.Created,
        active: TaskStatus.Active,
        completed: TaskStatus.Completed,
      };

      await taskService.updateTask(taskId, { status: apiStatusMap[newStatus] });
      toast.success("Task status updated");
    } catch (err) {
      console.error("Error updating task status:", err);
      toast.error("Failed to update task status");
      // Revert the optimistic update on error
      fetchTasks();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading board...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectHeader />
        <div className="px-6 py-8">
          <div className="pm-card p-8 text-center border-red-200 bg-red-50">
            <p className="text-red-600 font-medium mb-2">Failed to load board</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchTasks}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader />
      <div className="px-6 py-8">
        {/* Sprint Header */}
        {sprint && (
          <div className="mb-6 pm-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push(`/projects/${projectId}/timeline`)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Back to Timeline"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-900">{sprint.name}</h2>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      sprint.status === 'active' ? 'bg-orange-100 text-orange-800' :
                      sprint.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      sprint.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {sprint.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                    {sprint.goal && ` • ${sprint.goal}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {sprint.completed_task_count || 0} / {sprint.task_count || 0} tasks completed
                  </p>
                  <div className="w-32 h-2 bg-gray-100 rounded-full mt-1">
                    <div
                      className="h-full bg-orange-600 rounded-full"
                      style={{
                        width: `${sprint.task_count && sprint.task_count > 0
                          ? Math.round((sprint.completed_task_count || 0) / sprint.task_count * 100)
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
                {/* Sprint Actions */}
                {sprint.status === 'planning' && (
                  <button
                    onClick={async () => {
                      try {
                        await sprintService.startSprint(projectId, sprint.id.toString());
                        toast.success('Sprint started successfully');
                        fetchSprint();
                        fetchTasks();
                      } catch (err: any) {
                        toast.error(err.response?.data?.error || 'Failed to start sprint');
                      }
                    }}
                    className="pm-button-primary"
                  >
                    Start Sprint
                  </button>
                )}
                {sprint.status === 'active' && (
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to complete this sprint?')) {
                        try {
                          await sprintService.completeSprint(projectId, sprint.id.toString());
                          toast.success('Sprint completed successfully');
                          fetchSprint();
                          fetchTasks();
                        } catch (err: any) {
                          toast.error(err.response?.data?.error || 'Failed to complete sprint');
                        }
                      }
                    }}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
                  >
                    Complete Sprint
                  </button>
                )}
                <button
                  onClick={() => router.push(`/projects/${projectId}/timeline`)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Close Sprint View"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        {!sprint && sprintId && (
          <div className="mb-6 pm-card p-4 border-orange-200 bg-orange-50">
            <p className="text-sm text-orange-800">
              Sprint not found. <Link href={`/projects/${projectId}/timeline`} className="underline">Back to Timeline</Link>
            </p>
          </div>
        )}

        <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {columns.map((column) => (
              <DroppableColumn key={column.id} column={column} tasks={tasks} projectId={projectId} />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="bg-white rounded-lg border-2 border-gray-900 p-4 shadow-2xl w-[280px]">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{activeTask.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{activeTask.description}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default BoardPage;
