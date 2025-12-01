"use client";
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import ProjectHeader from "@/components/projects/ProjectHeader";
import TaskCard from "@/components/projects/TaskCard";
import { Separator } from "@/components/ui/separator";
import { Plus, Loader2, ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { getStatusColumnColor } from "@/lib/colorUtils";
import { getStatusLabel } from "@/lib/statusUtils";
import taskService from "@/services/taskService";
import sprintService from "@/services/sprintService";
import {
  Task,
  TaskStatus,
  TaskPriority,
  Sprint,
  SprintStatus,
} from "@/types/project";
import toast from "react-hot-toast";

interface Column {
  id: string;
  title: string;
  status: TaskStatus;
  color: string;
}

const columns: Column[] = [
  {
    id: "backlog",
    title: getStatusLabel(TaskStatus.Backlog),
    status: TaskStatus.Backlog,
    color: getStatusColumnColor("backlog"),
  },
  {
    id: "created",
    title: getStatusLabel(TaskStatus.Created),
    status: TaskStatus.Created,
    color: getStatusColumnColor("todo"),
  },
  {
    id: "active",
    title: getStatusLabel(TaskStatus.Active),
    status: TaskStatus.Active,
    color: getStatusColumnColor("in_progress"),
  },
  {
    id: "completed",
    title: getStatusLabel(TaskStatus.Completed),
    status: TaskStatus.Completed,
    color: getStatusColumnColor("done"),
  },
];

function DroppableColumn({
  column,
  tasks,
  projectId,
  onTaskUpdate,
  onTaskDelete,
}: {
  column: Column;
  tasks: Task[];
  projectId: string;
  onTaskUpdate: () => void;
  onTaskDelete: (taskId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  const columnTasks = tasks.filter((task) => task.status === column.status);

  return (
    <div className="flex-1 min-w-[240px] max-w-[260px]">
      <div
        ref={setNodeRef}
        className={`h-full flex flex-col transition-colors ${
          isOver ? "bg-gray-50" : ""
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

        <SortableContext
          items={columnTasks.map((t) => t.taskid)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[calc(100vh-300px)] space-y-3">
            {columnTasks.length > 0 ? (
              columnTasks.map((task) => (
                <TaskCard
                  key={task.taskid}
                  task={task}
                  projectId={projectId}
                  compact={true}
                  draggable={true}
                  onUpdate={onTaskUpdate}
                  onDelete={onTaskDelete}
                />
              ))
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
    // Modal state for task details
    const [modalTask, setModalTask] = useState<Task | null>(null);
    React.useEffect(() => {
      const handler = (e: any) => {
        setModalTask(e.detail);
      };
      window.addEventListener("openTaskModal", handler);
      return () => window.removeEventListener("openTaskModal", handler);
    }, []);
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
  const [filteredSprints, setFilteredSprints] = useState<Sprint[]>([]);

  // Fetch tasks and sprint data
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all sprints first
      const sprintsData = await sprintService.getSprints(projectId);
      setFilteredSprints(sprintsData);

      // Determine which sprint to load
      let targetSprintId = sprintId;
      
      if (!targetSprintId && sprintsData.length > 0) {
        // No sprint specified - find the current active sprint
        const activeSprint = sprintsData.find(s => s.status === SprintStatus.Active);
        
        if (activeSprint) {
          // Redirect to the active sprint
          router.replace(`/projects/${projectId}/board?sprint=${activeSprint.uuid}`);
          return; // Let the redirect trigger a new fetch
        } else {
          // No active sprint, use the most recent sprint
          const sortedSprints = [...sprintsData].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          if (sortedSprints.length > 0) {
            router.replace(`/projects/${projectId}/board?sprint=${sortedSprints[0].uuid}`);
            return;
          }
        }
      }

      if (targetSprintId) {
        // Fetch sprint details
        const sprintData = await sprintService.getSprint(projectId, targetSprintId);
        setSprint(sprintData);

        // Fetch tasks for this sprint - filter by sprint's integer ID
        const allTasks = await taskService.getTasks(projectId);
        const tasksData = allTasks.filter(task => task.sprint === sprintData.id);
        setTasks(tasksData);
      } else {
        // No sprints exist - show all tasks
        const tasksData = await taskService.getTasks(projectId);
        setTasks(tasksData);
      }
    } catch (err: any) {
      console.error("Error fetching board data:", err);
      setError(err.message || "Failed to load board data");
      toast.error("Failed to load board data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId, sprintId]);

  const handleTaskDeleted = (taskId: string) => {
    // Remove the task from the local state
    setTasks((prevTasks) => prevTasks.filter((task) => task.taskid !== taskId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.taskid === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = columns.find((col) => col.id === over.id)?.status;

    if (!newStatus) return;

    const task = tasks.find((t) => t.taskid === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistically update UI
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.taskid === taskId ? { ...t, status: newStatus } : t
      )
    );

    try {
      await taskService.updateTask(taskId, { status: newStatus });
      toast.success("Task status updated");
    } catch (err: any) {
      console.error("Error updating task status:", err);
      toast.error("Failed to update task status");
      // Revert on error
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
        <div className="px-6 py-8 overflow-x-hidden">
          <div className="pm-card p-8 text-center border-red-200 bg-red-50">
            <p className="text-red-600 font-medium mb-2">
              Failed to load board
            </p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button
              onClick={() => fetchTasks()}
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
      <div className="px-6 py-8 max-w-full overflow-x-hidden">
        {/* Sprint Header */}
        {sprint && (
          <div className="mb-6 pm-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Sprint navigation arrows */}
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Previous Sprint"
                  disabled={filteredSprints.length === 0 || !sprint || filteredSprints.findIndex(s => s.uuid === sprint.uuid) === 0}
                  onClick={() => {
                    if (!sprint) return;
                    const idx = filteredSprints.findIndex(s => s.uuid === sprint.uuid);
                    if (idx > 0) {
                      const prevSprint = filteredSprints[idx - 1];
                      router.push(`/projects/${projectId}/board?sprint=${prevSprint.uuid}`);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {sprint?.name}
                    </h2>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        sprint?.status === "active"
                          ? "bg-orange-100 text-orange-800"
                          : sprint?.status === "completed"
                          ? "bg-gray-100 text-gray-800"
                          : sprint?.status === "planning"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sprint?.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {sprint?.start_date ? new Date(sprint.start_date).toLocaleDateString() : ""} -{" "}
                    {sprint?.end_date ? new Date(sprint.end_date).toLocaleDateString() : ""}
                    {sprint?.goal && ` • ${sprint.goal}`}
                  </p>
                </div>
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Next Sprint"
                  disabled={filteredSprints.length === 0 || !sprint || filteredSprints.findIndex(s => s.uuid === sprint.uuid) === filteredSprints.length - 1}
                  onClick={() => {
                    if (!sprint) return;
                    const idx = filteredSprints.findIndex(s => s.uuid === sprint.uuid);
                    if (idx < filteredSprints.length - 1) {
                      const nextSprint = filteredSprints[idx + 1];
                      router.push(`/projects/${projectId}/board?sprint=${nextSprint.uuid}`);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {sprint?.completed_task_count || 0} /{" "}
                    {sprint?.task_count || 0} tasks completed
                  </p>
                  <div className="w-32 h-2 bg-gray-100 rounded-full mt-1">
                    <div
                      className="h-full bg-orange-600 rounded-full"
                      style={{
                        width: `${
                          sprint?.task_count && sprint?.task_count > 0
                            ? Math.round(
                                ((sprint?.completed_task_count || 0) /
                                  sprint?.task_count) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task Modal */}
        {modalTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setModalTask(null)}
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold mb-2">{modalTask.name}</h2>
              <p className="mb-2 text-gray-700">{modalTask.description || modalTask.details}</p>
              <div className="mb-2">
                <span className="font-semibold">Status:</span> {modalTask.status}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Priority:</span> {modalTask.priority}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Assigned to:</span> {Array.isArray(modalTask.assigned_to) ? modalTask.assigned_to.map(u => typeof u === "object" && "name" in u ? (u as any).name : typeof u === "string" ? u : "User").join(", ") : "Unassigned"}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Created at:</span> {new Date(modalTask.created_at).toLocaleString()}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Updated at:</span> {new Date(modalTask.updated_at).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Sprint not found message */}


        {!sprint && sprintId && (
          <div className="mb-6 pm-card p-4 border-orange-200 bg-orange-50">
            <p className="text-sm text-orange-800">
              Sprint not found.{" "}
              <Link
                href={`/projects/${projectId}/timeline`}
                className="underline"
              >
                Back to Timeline
              </Link>
            </p>
          </div>
        )}

        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            className="w-full overflow-x-auto overflow-y-visible"
            style={{ maxWidth: "100%" }}
          >
            <div className="flex gap-6 pb-4 min-w-max scrollbar-hide">
              {columns.map((column, index) => (
                <React.Fragment key={column.id}>
                  <DroppableColumn
                    column={column}
                    tasks={tasks}
                    projectId={projectId}
                    onTaskUpdate={fetchTasks}
                    onTaskDelete={handleTaskDeleted}
                  />
                  {index < columns.length - 1 && (
                    <Separator
                      orientation="vertical"
                      className="h-auto bg-gray-200 flex-shrink-0"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="bg-white rounded-lg border-2 border-gray-900 p-4 shadow-2xl w-[240px]">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">
                  {activeTask.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {activeTask.description || activeTask.details}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default BoardPage;
