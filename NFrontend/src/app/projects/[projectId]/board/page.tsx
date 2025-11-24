"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ProjectHeader from "@/components/projects/ProjectHeader";
import { Plus, User, Flag, Calendar, MoreVertical, GripVertical } from "lucide-react";
import Link from "next/link";
import { getStatusColumnColor, getPriorityClass } from "@/lib/colorUtils";

// Mock tasks data for this project
const getMockTasks = (projectId: string): Task[] => [
  { id: 1, title: "Implement user authentication", assignee: "John Doe", dueDate: "2024-02-15", priority: "high" as const, status: "in_progress", tags: ["Backend", "Security"], description: "Set up JWT authentication with refresh tokens" },
  { id: 2, title: "Design product catalog UI", assignee: "Jane Smith", dueDate: "2024-02-18", priority: "medium" as const, status: "todo", tags: ["Frontend", "UI"], description: "Create responsive product listing page" },
  { id: 3, title: "Set up shopping cart functionality", assignee: "Mike Johnson", dueDate: "2024-02-20", priority: "high" as const, status: "todo", tags: ["Frontend", "Backend"], description: "Implement cart state management and API" },
  { id: 4, title: "Payment integration", assignee: "Sarah Wilson", dueDate: "2024-02-25", priority: "high" as const, status: "backlog", tags: ["Backend", "Payment"], description: "Integrate Stripe payment gateway" },
  { id: 5, title: "Write API documentation", assignee: "Alex Brown", dueDate: "2024-02-22", priority: "low" as const, status: "done", tags: ["Documentation"], description: "Document all REST API endpoints" },
  { id: 6, title: "Database schema design", assignee: "Chris Lee", dueDate: "2024-02-17", priority: "high" as const, status: "done", tags: ["Database"], description: "Design and implement database schema" },
  { id: 7, title: "User profile page", assignee: "John Doe", dueDate: "2024-02-19", priority: "medium" as const, status: "in_progress", tags: ["Frontend"], description: "Create user profile page with edit functionality" },
  { id: 8, title: "Email notifications", assignee: "Jane Smith", dueDate: "2024-02-21", priority: "low" as const, status: "backlog", tags: ["Backend"], description: "Set up email notification system" },
];

interface Task {
  id: number;
  title: string;
  assignee: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "backlog" | "todo" | "in_progress" | "done";
  tags: string[];
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
  { id: "todo", title: "To Do", status: "todo", color: getStatusColumnColor("todo") },
  { id: "in_progress", title: "In Progress", status: "in_progress", color: getStatusColumnColor("in_progress") },
  { id: "done", title: "Done", status: "done", color: getStatusColumnColor("done") },
];

function TaskCard({ task }: { task: Task }) {
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
          <Link href={`/projects/${task.id}/task/${task.id}`} className="flex-1 min-w-0">
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

      <div className="flex flex-wrap gap-1 mb-3">
        {task.tags.slice(0, 2).map((tag, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200"
          >
            {tag}
          </span>
        ))}
        {task.tags.length > 2 && (
          <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200">
            +{task.tags.length - 2}
          </span>
        )}
      </div>

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

function DroppableColumn({ column, tasks }: { column: Column; tasks: Task[] }) {
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
              columnTasks.map((task) => <TaskCard key={task.id} task={task} />)
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
  const projectId = params.projectId as string;
  const [tasks, setTasks] = useState<Task[]>(getMockTasks(projectId));
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = tasks.find((t) => t.id.toString() === taskId);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const column = columns.find((col) => col.id === overId);
    if (column) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id.toString() === taskId ? { ...task, status: column.status } : task
        )
      );
      return;
    }

    // Check if dropped on another task (find the column of that task)
    const overTask = tasks.find((t) => t.id.toString() === overId);
    if (overTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id.toString() === taskId ? { ...task, status: overTask.status } : task
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader />
      <div className="px-6 py-8">
        <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {columns.map((column) => (
              <DroppableColumn key={column.id} column={column} tasks={tasks} />
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
