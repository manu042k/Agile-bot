import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import AvatarCircles from "@/components/ui/avatar-circles";
import { Badge } from "../ui/badge";
import { Task, TaskStatus } from "@/types/project";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import TaskViewComponent from "./TaskViewComponent";
import { User } from "@/types/user";

interface Props {
  task: Task;
}
const TaskCardComponent: React.FC<Props> = ({ task }) => {
  const avatarData: string[] = task.assigned_to
    ? Array.isArray(task.assigned_to)
      ? typeof task.assigned_to[0] === "object"
        ? (task.assigned_to as User[]).map((user) => user.first_name)
        : (task.assigned_to as number[]).map(String)
      : []
    : [];
  return (
    <Card className="w-full sm:w-[220px] md:w-[260px] lg:w-[300px] xl:w-[350px] mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="truncate">
          Task Number:{task.task_number}{" "}
        </CardTitle>
        <CardTitle>{task.name} </CardTitle>
        <CardDescription>
          {task.description.split(" ").slice(0, 5).join(" ")} ...
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">Assigned to:</h3>
          <AvatarCircles avatarData={avatarData} />{" "}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="link">View Task</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl h-auto max-h-[150vh] overflow-auto p-4">
            <TaskViewComponent
              task={task}
              onUpdate={() => {
                /* handle update */
              }}
            ></TaskViewComponent>
          </DialogContent>
        </Dialog>

        {task.status == TaskStatus.Completed && (
          <Badge className="bg-green-400 hover:bg-green-600">
            {TaskStatus.Completed}
          </Badge>
        )}
        {task.status == TaskStatus.Active && (
          <Badge className="bg-blue-400 hover:bg-blue-600">{task.status}</Badge>
        )}
        {task.status == TaskStatus.Created && (
          <Badge className="bg-yellow-400 hover:bg-yellow-600">
            {task.status}
          </Badge>
        )}
        {task.status == TaskStatus.Backlog && (
          <Badge className="bg-red-400 hover:bg-red-600">{task.status}</Badge>
        )}
        <Badge variant="secondary" className="mr-2">
          {task.created_by}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default TaskCardComponent;
