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
    <Card className="bg-white border-2 border-gray-200 rounded-lg w-full group hover:border-gray-900 hover:shadow-xl transition-all duration-300">
      <CardHeader className="space-y-4 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Task #{task.task_number}
              </span>
              {task.status === TaskStatus.Completed && (
                <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200 font-semibold px-3 py-1">
                  Completed
                </Badge>
              )}
              {task.status === TaskStatus.Active && (
                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200 font-semibold px-3 py-1">
                  Active
                </Badge>
              )}
              {task.status === TaskStatus.Created && (
                <Badge className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-2 border-yellow-200 font-semibold px-3 py-1">
                  Created
                </Badge>
              )}
              {task.status === TaskStatus.Backlog && (
                <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300 font-semibold px-3 py-1">
                  Backlog
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-black transition-colors">
              {task.name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {task.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned:</span>
            {avatarData.length > 0 ? (
              <AvatarCircles avatarData={avatarData} />
            ) : (
              <span className="text-sm text-gray-500 font-medium italic">Unassigned</span>
            )}
          </div>
        </div>
        
        {task.priority && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority:</span>
            <Badge variant="outline" className="text-xs font-semibold border-2 px-3 py-1">
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t-2 border-gray-100 pt-5">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full hover:bg-gray-100 font-semibold text-gray-900 h-11">
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
