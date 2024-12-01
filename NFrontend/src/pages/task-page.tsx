import TaskCardComponent from "@/components/projects/TaskCardComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, X } from "lucide-react";
import React from "react";

const TaskPage = () => {
  return (
    <>
      <div className="fixed w-full bg-white shadow-sm p-4 z-10">
        <h2 className="text-2xl font-bold">Tasks List</h2>
        <Separator className="my-4" />

        <div className="flex items-center gap-4">
          <div>
            <Button type="submit" className="flex items-center gap-2">
              <Plus />
              New Task
            </Button>
          </div>

          <div className="w-[500px]">
            <Input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="">
            <Select>
              <SelectTrigger className="w-[250px] px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent className="absolute z-20 bg-white shadow-md rounded-md mt-2">
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="backlog">Backlog</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Button variant="secondary">
              <X />
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-36 p-4">
        <div
          className="grid gap-y-6 gap-x-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
          style={{
            maxHeight: "calc(100vh - 150px)", // Adjust height to fit your layout
            overflowY: "auto",
          }}
        >
          <TaskCardComponent />
          <TaskCardComponent />
          <TaskCardComponent />
          <TaskCardComponent />
          <TaskCardComponent />
          <TaskCardComponent />
          <TaskCardComponent />
          <TaskCardComponent />
          <TaskCardComponent />
          <TaskCardComponent />
          <TaskCardComponent />
        </div>
      </div>
    </>
  );
};

export default TaskPage;
