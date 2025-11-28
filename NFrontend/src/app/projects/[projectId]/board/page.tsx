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
import { Task, TaskStatus, TaskPriority, Sprint } from "@/types/project";
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
}: {
  column: Column;
  tasks: Task[];
  projectId: string;
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

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await taskService.getTasks(projectId);

      // Filter by sprint if sprintId is provided
      let filteredTasks = fetchedTasks;
      if (sprintId) {
        filteredTasks = fetchedTasks.filter(
          (task: Task) => task.sprint && task.sprint.toString() === sprintId
        );
      }

      setTasks(filteredTasks);
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
    const task = tasks.find((t) => t.taskid === taskId);
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
    let newStatus: TaskStatus | null = null;

    if (column) {
      newStatus = column.status;
    } else {
      // Check if dropped on another task (find the column of that task)
      const overTask = tasks.find((t) => t.taskid === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (!newStatus) return;

    // Optimistically update the UI
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.taskid === taskId ? { ...task, status: newStatus! } : task
      )
    );

    // Update the task status in the backend
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
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
            <p className="text-red-600 font-medium mb-2">
              Failed to load board
            </p>
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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <ProjectHeader />
      <div className="px-6 py-8 max-w-full">
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
                    <h2 className="text-xl font-semibold text-gray-900">
                      {sprint.name}
                    </h2>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        sprint.status === "active"
                          ? "bg-orange-100 text-orange-800"
                          : sprint.status === "completed"
                          ? "bg-gray-100 text-gray-800"
                          : sprint.status === "planning"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sprint.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(sprint.start_date).toLocaleDateString()} -{" "}
                    {new Date(sprint.end_date).toLocaleDateString()}
                    {sprint.goal && ` • ${sprint.goal}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {sprint.completed_task_count || 0} /{" "}
                    {sprint.task_count || 0} tasks completed
                  </p>
                  <div className="w-32 h-2 bg-gray-100 rounded-full mt-1">
                    <div
                      className="h-full bg-orange-600 rounded-full"
                      style={{
                        width: `${
                          sprint.task_count && sprint.task_count > 0
                            ? Math.round(
                                ((sprint.completed_task_count || 0) /
                                  sprint.task_count) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                {/* Sprint Actions */}
                {sprint.status === "planning" && (
                  <button
                    onClick={async () => {
                      try {
                        await sprintService.startSprint(
                          projectId,
                          sprint.id.toString()
                        );
                        toast.success("Sprint started successfully");
                        fetchSprint();
                        fetchTasks();
                      } catch (err: any) {
                        toast.error(
                          err.response?.data?.error || "Failed to start sprint"
                        );
                      }
                    }}
                    className="pm-button-primary"
                  >
                    Start Sprint
                  </button>
                )}
                {sprint.status === "active" && (
                  <button
                    onClick={async () => {
                      if (
                        confirm(
                          "Are you sure you want to complete this sprint?"
                        )
                      ) {
                        try {
                          await sprintService.completeSprint(
                            projectId,
                            sprint.id.toString()
                          );
                          toast.success("Sprint completed successfully");
                          fetchSprint();
                          fetchTasks();
                        } catch (err: any) {
                          toast.error(
                            err.response?.data?.error ||
                              "Failed to complete sprint"
                          );
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
