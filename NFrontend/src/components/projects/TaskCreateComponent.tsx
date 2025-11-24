"use client";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import {
  CreatedBy,
  TaskPriority,
  TaskSize,
  TaskStatus,
} from "@/types/project";
import taskService from "@/services/taskService";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface props {
  projectId: string;
  onClose: () => void; // Callback to handle closing the dialog
}

const TaskCreateComponent: React.FC<props> = ({ projectId, onClose }) => {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Normal);
  const [size, setSize] = useState<TaskSize>(TaskSize.Medium);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const processedData = {
        name,
        description,
        details,
        priority,
        size,
        created_by: CreatedBy.USER,
        status: TaskStatus.Created,
        Project: projectId,
      };

      await taskService.createTask(processedData);
      toast.success("Task created successfully!");
      setName("");
      setDescription("");
      setDetails("");
      setPriority(TaskPriority.Normal);
      setSize(TaskSize.Medium);
      onClose();
      router.refresh();
    } catch (err: any) {
      setError("Failed to create task. Please try again.");
      toast.error("Failed to create task. Please try again");
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900">Create Task</DialogTitle>
        <DialogDescription className="text-gray-600">
          Fill in the details to create a new task.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleCreateTask} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="task-name" className="text-sm font-medium text-gray-700">
            Task Name
          </Label>
          <Input
            id="task-name"
            placeholder="Enter task name"
            className="pm-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-desc" className="text-sm font-medium text-gray-700">
            Description
          </Label>
          <Textarea
            id="task-desc"
            className="pm-input min-h-[80px]"
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-details" className="text-sm font-medium text-gray-700">
            Details <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <Textarea
            id="task-details"
            className="pm-input min-h-[80px]"
            placeholder="Enter additional details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="task-priority" className="text-sm font-medium text-gray-700">
              Priority
            </Label>
            <select
              id="task-priority"
              className="pm-input"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              required
            >
              {Object.values(TaskPriority).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-size" className="text-sm font-medium text-gray-700">
              Size
            </Label>
            <select
              id="task-size"
              className="pm-input"
              value={size}
              onChange={(e) => setSize(e.target.value as TaskSize)}
              required
            >
              {Object.values(TaskSize).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="submit" className="pm-button-primary w-full sm:w-auto">
            Create Task
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default TaskCreateComponent;
