import React, { useEffect, useState } from "react";
import {
  Task,
  TaskPriority,
  TaskStatus,
  TaskSize,
  TeamMember,
} from "@/types/project";
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
import { Separator } from "../ui/separator";
import { Pen } from "lucide-react";
import AvatarCircles from "../ui/avatar-circles";
import taskService from "@/services/taskService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import projectService from "@/services/projectService";

interface Props {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
}

const TaskViewComponent: React.FC<Props> = ({ task, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [isDirty, setIsDirty] = useState(false);
  const [projectMembers, setProjectMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await projectService.getProject(task.Project);
        setProjectMembers(response.team.members);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch project members");
      }
    };
    fetchMembers();
  }, [task.Project]);

  const navigate = useNavigate();

  const handleChange = (key: keyof Task, value: any) => {
    setEditedTask({ ...editedTask, [key]: value });
    setIsDirty(true);
  };

  const handleAssignedToChange = (
    selectedOptions: HTMLCollectionOf<HTMLOptionElement>
  ) => {
    const selectedIds = Array.from(selectedOptions).map(
      (option) => option.value
    );
    handleChange("assigned_to", selectedIds);
  };

  const handleSave = async () => {
    try {
      await taskService.updateTask(task.taskid, editedTask);
      toast.success("Task updated successfully");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update task");
    } finally {
      onUpdate(editedTask);
      setIsEditing(false);
      setIsDirty(false);
      navigate(0);
    }
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
    setIsDirty(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center ">
        <h2 className="text-2xl font-bold">
          {isEditing ? "Edit Task" : "Task Details"}
        </h2>
        {!isEditing && (
          <Pen className="pl-2" onClick={() => setIsEditing(true)} />
        )}
      </div>

      <Separator className="my-4" />

      {/* Task Form */}
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="flex flex-col">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={editedTask.name}
              readOnly={!isEditing}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <Label htmlFor="status">Status</Label>
            <Select
              value={editedTask.status}
              disabled={!isEditing}
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
              disabled={!isEditing}
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
              disabled={!isEditing}
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

          {/* Modified Assigned to Component */}
          <div className="space-y-2">
            <Label>Assigned to</Label>
            {!isEditing ? (
              <AvatarCircles
                avatarData={
                  Array.isArray(editedTask.assigned_to)
                    ? editedTask.assigned_to
                    : []
                }
              />
            ) : (
              <select
                name="Assigned to"
                id="assigned_to"
                multiple
                onChange={(e) =>
                  handleAssignedToChange(e.target.selectedOptions)
                }
                className="w-full p-2 border-2 border-blue-500 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {projectMembers.map((member) => (
                  <option
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    key={member.user.id}
                    value={member.user.id}
                  >
                    {member.user.first_name} {member.user.last_name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="flex flex-col">
            <Label htmlFor="description">Description</Label>
            <Textarea
              className="h-32"
              id="description"
              value={editedTask.description}
              readOnly={!isEditing}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <Label htmlFor="details">Details</Label>
            <Textarea
              className="h-32"
              id="details"
              value={editedTask.details}
              readOnly={!isEditing}
              onChange={(e) => handleChange("details", e.target.value)}
            />
          </div>
        </div>
      </form>

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <div className="flex space-x-4">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskViewComponent;
