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
    <Card className="crm-card crm-card-hover w-full group">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                #{task.task_number}
              </span>
              {task.status === TaskStatus.Completed && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-300">
                  Completed
                </Badge>
              )}
              {task.status === TaskStatus.Active && (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300">
                  Active
                </Badge>
              )}
              {task.status === TaskStatus.Created && (
                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300">
                  Created
                </Badge>
              )}
              {task.status === TaskStatus.Backlog && (
                <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300">
                  Backlog
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {task.name}
            </CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {task.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Assigned to:</span>
            {avatarData.length > 0 ? (
              <AvatarCircles avatarData={avatarData} />
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Unassigned
              </span>
            )}
          </div>
        </div>

        {task.priority && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Priority:</span>
            <Badge variant="outline" className="text-xs">
              {task.priority}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t pt-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full hover:bg-primary/5">
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl h-auto max-h-[90vh] overflow-auto">
            <TaskViewComponent
              task={task}
              onUpdate={() => {
                /* handle update */
              }}
            />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default TaskCardComponent;
