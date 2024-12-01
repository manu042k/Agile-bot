import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AvatarCircles from "@/components/ui/avatar-circles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

type Task = {
  id: string;
  name: string;
  description: string;
  details: string;
  status: string;
  priority: string;
  size: string;
  relatedWork: string;
  assignedTo: string;
  comments?: string[];
};

const TaskCardComponent = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [task, setTask] = useState<Task>({
    id: "TASK-001",
    name: "Example Task",
    description:
      "This is an example task description.This is an example task description.This is an example task description.This This is an example task description.This is an example task description.This is an example task description.is an example task description.This is an example task description.This is an example task description.This is an example task description.This is an example task description.This is an example task description.This is an example task description.",
    details: "These are the task details.",
    status: "In Progress",
    priority: "Medium",
    size: "Medium",
    relatedWork: "PROJ-001",
    assignedTo: "John Doe",
    comments: ["Comment 1", "Comment 2"],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTask((prevTask) => ({ ...prevTask, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setTask((prevTask) => ({ ...prevTask, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    console.log("Task saved:", task);
  };

  const renderField = (
    label: string,
    name: keyof Task,
    type: "text" | "textarea" | "select",
    options?: string[]
  ) => (
    <div className="space-y-2">
      <Label className="truncate font-semibold" htmlFor={name}>
        {label}
      </Label>
      {isEditing ? (
        type === "select" ? (
          <Select
            onValueChange={handleSelectChange(name)}
            defaultValue={
              typeof task[name] === "string" ? task[name] : undefined
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : type === "textarea" ? (
          <Textarea
            id={name}
            name={name}
            value={task[name]}
            onChange={handleInputChange}
            className="w-full"
          />
        ) : (
          <Input
            type="text"
            id={name}
            name={name}
            value={task[name]}
            onChange={handleInputChange}
            className="w-full"
          />
        )
      ) : (
        <p className="text-sm text-gray-600">{task[name]}</p>
      )}
    </div>
  );

  const avatars = [
    {
      imageUrl: "https://avatars.githubusercontent.com/u/16860528",
      profileUrl: "https://github.com/dillionverma",
    },
    {
      imageUrl: "https://avatars.githubusercontent.com/u/20110627",
      profileUrl: "https://github.com/tomonarifeehan",
    },
  ];

  return (
    <Card className="w-full sm:w-[220px] md:w-[260px] lg:w-[300px] xl:w-[350px] mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="truncate">Task #{task.id}</CardTitle>
        <CardDescription>{task.name}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">Assigned to:</h3>
          <AvatarCircles avatarUrls={avatars} />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">View Task</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl h-auto max-h-[90vh] overflow-auto p-4">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Task" : "Task Details"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Modify task details."
                  : "View and edit task information."}
              </DialogDescription>
            </DialogHeader>
            <Separator></Separator>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="space-y-4">
                {renderField("Task ID", "id", "text")}
                {renderField("Task Name", "name", "text")}
                {renderField("Description", "description", "textarea")}
                {renderField("Details", "details", "textarea")}
                {renderField("Comments", "comments", "textarea")}
              </div>
              <div className="space-y-4">
                {renderField("Status", "status", "select", [
                  "Not Started",
                  "In Progress",
                  "Completed",
                ])}
                {renderField("Priority", "priority", "select", [
                  "Low",
                  "Medium",
                  "High",
                ])}
                {renderField("Size", "size", "select", [
                  "Small",
                  "Medium",
                  "Large",
                ])}
                {renderField("Related Work", "relatedWork", "text")}
                {renderField("Assigned To", "assignedTo", "text")}
              </div>
            </form>

            <DialogFooter className="flex justify-end">
              {isEditing ? (
                <>
                  <Button type="submit" onClick={handleSubmit}>
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(true)}>Modify</Button>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Badge className="bg-orange-400 hover:bg-orange-600">Active</Badge>
      </CardFooter>
    </Card>
  );
};

export default TaskCardComponent;
