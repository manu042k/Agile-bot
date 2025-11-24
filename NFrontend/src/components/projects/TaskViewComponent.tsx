"use client";

import React, { useState, useEffect, useCallback, useReducer } from "react";
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
import { Pen, Trash2 } from "lucide-react";
import AvatarCircles from "../ui/avatar-circles";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import taskService from "@/services/taskService";
import projectService from "@/services/projectService";
import {
  Task,
  TaskPriority,
  TaskStatus,
  TaskSize,
  TeamMember,
} from "@/types/project";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

// Action Types for Reducer
const SET_FIELD = "SET_FIELD";

// Reducer function for handling state updates
const taskReducer = (state: Task, action: { type: string; payload: any }) => {
  switch (action.type) {
    case SET_FIELD:
      return { ...state, [action.payload.key]: action.payload.value };
    default:
      return state;
  }
};

interface Props {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
}

const TaskViewComponent: React.FC<Props> = ({ task, onUpdate }) => {
  const [state, dispatch] = useReducer(taskReducer, { ...task });
  const [projectMembers, setProjectMembers] = useState<TeamMember[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // Fetch project members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await projectService.getProject(task.Project);
        setProjectMembers(response.team.members);
      } catch (err) {
        toast.error("Failed to fetch project members.");
      }
    };
    fetchMembers();
  }, [task.Project]);

  // Handle input changes
  const handleChange = useCallback((key: keyof Task, value: any) => {
    dispatch({ type: SET_FIELD, payload: { key, value } });
  }, []);

  // Handle multi-select changes for assigned members
  const handleAssignedToChange = (
    selectedOptions: HTMLCollectionOf<HTMLOptionElement>
  ) => {
    const selectedIds: number[] = Array.from(selectedOptions).map((option) =>
      Number(option.value)
    );
    handleChange("assigned_to", selectedIds);
  };

  // Save the task changes
  const handleSave = async () => {
    try {
      await taskService.updateTask(task.taskid, state);
      onUpdate(state);
      setIsEditing(false);
      router.refresh();
      toast.success("Task updated successfully");
    } catch (err) {
      toast.error("Failed to update task");
      console.log(err);
    }
  };

  // Cancel editing and revert changes
  const handleCancel = () => {
    dispatch({
      type: SET_FIELD,
      payload: { key: "assigned_to", value: task.assigned_to },
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await taskService.removeTask(task.taskid);
      router.refresh();
      toast.success("Task deleted successfully");
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };
  return (
    <div className="space-y-4">
      {/* Task Header */}
      <div className="crm-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {isEditing ? "Edit Task" : "Task Details"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing ? "Update task information" : "View and manage task"}
            </p>
          </div>
          {!isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Pen className="w-4 h-4" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the task and remove all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : null}
        </div>
      </div>

      {/* Task Form */}
      <div className="crm-card p-6">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <InputField
              label="Name"
              value={state.name}
              readOnly={!isEditing}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("name", e.target.value)
              }
            />
            <SelectField
              label="Status"
              value={state.status}
              options={Object.values(TaskStatus)}
              disabled={!isEditing}
              onChange={(value: string) => handleChange("status", value)}
            />
            <SelectField
              label="Priority"
              value={state.priority}
              options={Object.values(TaskPriority)}
              disabled={!isEditing}
              onChange={(value: string) => handleChange("priority", value)}
            />
            <SelectField
              label="Size"
              value={state.size}
              options={Object.values(TaskSize)}
              disabled={!isEditing}
              onChange={(value: string) => handleChange("size", value)}
            />
            <AssignedToField
              isEditing={isEditing}
              assignedTo={state.assigned_to}
              projectMembers={projectMembers}
              onChange={handleAssignedToChange}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <TextareaField
              label="Description"
              value={state.description}
              readOnly={!isEditing}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleChange("description", e.target.value)
              }
            />
            <TextareaField
              label="Details"
              value={state.details}
              readOnly={!isEditing}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleChange("details", e.target.value)
              }
            />
          </div>
        </form>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button onClick={handleSave} className="min-w-24">
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, readOnly }: any) => (
  <div className="flex flex-col">
    <Label>{label}</Label>
    <Input value={value} onChange={onChange} readOnly={readOnly} />
  </div>
);

const SelectField = ({ label, value, options, onChange, disabled }: any) => (
  <div className="flex flex-col">
    <Label>{label}</Label>
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option: string) => (
          <SelectItem key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1).replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const TextareaField = ({ label, value, onChange, readOnly }: any) => (
  <div className="flex flex-col">
    <Label>{label}</Label>
    <Textarea
      className="h-36"
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  </div>
);

const AssignedToField = ({
  isEditing,
  assignedTo,
  projectMembers,
  onChange,
}: any) => (
  <div className="space-y-2">
    <Label>Assigned to</Label>
    {!isEditing ? (
      <AvatarCircles avatarData={assignedTo} />
    ) : (
      <select
        multiple
        value={assignedTo}
        onChange={(e) => onChange(e.target.selectedOptions)}
        className="w-full p-2 border-2 border-blue-500 rounded-md bg-white text-gray-700"
      >
        {projectMembers.map((member: TeamMember) => (
          <option key={member.user.id} value={member.user.id}>
            {member.user.first_name} {member.user.last_name}
          </option>
        ))}
      </select>
    )}
  </div>
);

export default TaskViewComponent;
