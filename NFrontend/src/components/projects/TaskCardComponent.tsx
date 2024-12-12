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

interface Props {
  task: Task;
}
const TaskCardComponent: React.FC<Props> = ({ task }) => {
  const avatarNames = [
    { firstName: "Alice", lastName: "Brown" },
    { firstName: "Bob", lastName: "Smith" },
    { firstName: "Charlie", lastName: "Johnson" },
  ];
  return (
    <Card className="w-full sm:w-[220px] md:w-[260px] lg:w-[300px] xl:w-[350px] mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="truncate">
          Task Number:{task.task_number}{" "}
        </CardTitle>
        <CardTitle>{task.name} </CardTitle>
        <CardDescription>{task.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">Assigned to:</h3>
          <AvatarCircles avatarNames={avatarNames} numPeople={2} />{" "}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="link">View Task</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl h-auto max-h-[90vh] overflow-auto p-4">
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
