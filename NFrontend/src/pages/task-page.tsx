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
import { useLocation } from "react-router-dom";

const TaskPage = () => {
  const location = useLocation();
  const projectId = location.pathname.split("/")[2];

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

    // Search filter
    if (query) {
      filtered = filtered.filter((task) =>
        task.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Status filter
    if (status && status !== "all") {
      filtered = filtered.filter((task) => task.status === status);
    }

    setFilteredTasks(filtered);
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    filterTasks(query, selectedFilter);
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setSelectedFilter(value as TaskStatus | "all");
    filterTasks(searchQuery, value as TaskStatus | "all");
  };

  // Clear filters function
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedFilter("all");
    setFilteredTasks(tasks); // Reset to show all tasks
  };

  return (
    <>
      <div className="fixed w-full bg-white shadow-sm p-4 z-10">
        <h2 className="text-2xl font-bold">Tasks List</h2>
        <Separator className="my-4" />

        <div className="flex items-center gap-4">
          <div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <TaskCreateComponent
                  onClose={() => setIsDialogOpen(false)}
                  projectId={projectId}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="w-[500px]">
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search..."
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="bg-white">
            <Select value={selectedFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[250px] px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent className="absolute z-20 bg-white shadow-md rounded-md mt-2">
                <SelectItem value="all">All</SelectItem>
                {Object.values(TaskStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Button variant="secondary" onClick={handleClearFilters}>
              <X />
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-36"></div>
      <div className="p-4">
        <div
          className="grid gap-y-6 gap-x-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
          style={{
            maxHeight: "calc(100vh - 150px)",
            overflowY: "auto",
          }}
        >
          {filteredTasks &&
            filteredTasks.map((task) => <TaskCardComponent task={task} />)}
        </div>
      </div>
    </>
  );
};

export default TaskPage;
