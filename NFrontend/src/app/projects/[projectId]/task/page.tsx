"use client";
import TaskCardComponent from "@/components/projects/TaskCardComponent";
import TaskCreateComponent from "@/components/projects/TaskCreateComponent";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import taskService from "@/services/taskService";
import { Task, TaskStatus } from "@/types/project";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const TaskPage = ({ params }: { params: { projectId: string } }) => {
  const projectId = params.projectId;

  const [tasks, setTasks] = useState<Task[] | null>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[] | null>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<TaskStatus | "all">(
    "all"
  );

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await taskService.getTasks(projectId);
        setTasks(response);
        setFilteredTasks(response); // Initially, show all tasks
      } catch (err: any) {
        console.log(err);
        toast.error("Failed to fetch tasks. Please try again.");
      }
    };
    fetchTasks();
  }, [projectId]);

  // Filter function
  const filterTasks = (query: string, status: TaskStatus | "all") => {
    let filtered = tasks || [];

    if (query) {
      filtered = filtered.filter((task) =>
        task.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((task) => task.status === status);
    }

    setFilteredTasks(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    filterTasks(e.target.value, selectedFilter);
  };

  const handleFilterChange = (value: TaskStatus | "all") => {
    setSelectedFilter(value);
    filterTasks(searchQuery, value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    filterTasks("", selectedFilter);
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0">
              <Plus className="mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <TaskCreateComponent
              projectId={projectId}
              onClose={() => {
                taskService.getTasks(projectId).then((tasks) => {
                  setTasks(tasks);
                  filterTasks(searchQuery, selectedFilter);
                });
                setIsDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={clearSearch}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <Select onValueChange={handleFilterChange} value={selectedFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks &&
          filteredTasks.map((task) => (
            <TaskCardComponent key={task.taskid} task={task} />
          ))}
      </div>
    </div>
  );
};

export default TaskPage;
