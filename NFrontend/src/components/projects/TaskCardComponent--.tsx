import React, { useState } from "react";

import { Task, TaskPriority, TaskStatus, TaskSize } from "@/types/project";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Props {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
}

const TaskViewComponent: React.FC<Props> = ({ task, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(task);

  const handleChange = (key: keyof Task, value: any) => {
    setEditedTask({ ...editedTask, [key]: value });
  };

  const handleSave = () => {
    onUpdate(editedTask);
    setIsEditing(false);
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md">
      {/* Title */}
      <h2 className="text-xl font-bold mb-4">
        {isEditing ? "Edit Task" : "Task Details"}
      </h2>

      {/* Display Mode */}
      {!isEditing ? (
        <div className="space-y-4">
          <p>
            <strong>Task ID:</strong> {task.taskid}
          </p>
          <p>
            <strong>Name:</strong> {task.name}
          </p>
          <p>
            <strong>Description:</strong> {task.description}
          </p>
          <p>
            <strong>Details:</strong> {task.details}
          </p>
          <p>
            <strong>Status:</strong> {task.status}
          </p>
          <p>
            <strong>Priority:</strong> {task.priority}
          </p>
          <p>
            <strong>Size:</strong> {task.size}
          </p>
          <p>
            <strong>Assigned To:</strong>{" "}
            {task.assigned_to?.first_name || "Unassigned"}
          </p>
          <p>
            <strong>Task Number:</strong> {task.task_number}
          </p>
          <Button onClick={() => setIsEditing(true)}>Edit Task</Button>
        </div>
      ) : (
        // Editable Form
        <form className="space-y-4">
          <div className="flex flex-col">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={editedTask.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedTask.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              value={editedTask.details}
              onChange={(e) => handleChange("details", e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <Label htmlFor="status">Status</Label>
            <Select
              value={editedTask.status}
              onValueChange={(value) =>
                handleChange("status", value as TaskStatus)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={editedTask.priority}
              onValueChange={(value) =>
                handleChange("priority", value as TaskPriority)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <Label htmlFor="size">Size</Label>
            <Select
              value={editedTask.size}
              onValueChange={(value) => handleChange("size", value as TaskSize)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="s">Small</SelectItem>
                <SelectItem value="m">Medium</SelectItem>
                <SelectItem value="l">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-x-2">
            <Button type="button" onClick={handleSave}>
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TaskViewComponent;
