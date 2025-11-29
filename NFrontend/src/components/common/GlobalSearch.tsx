"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, FolderKanban, CheckSquare, Calendar, Loader2 } from "lucide-react";
import projectService from "@/services/projectService";
import taskService from "@/services/taskService";
import { Project, Task } from "@/types/project";

export default function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<(Task & { projectName?: string })[]>([]);
  const [loading, setLoading] = useState(false);

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch projects and tasks when popover opens
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch projects
      const projectsData = await projectService.getProjects();
      setProjects(projectsData);

      // Fetch tasks from all projects
      const tasksPromises = projectsData.map(async (project) => {
        try {
          const tasks = await taskService.getTasks(project.id.toString());
          return tasks.map((task: Task) => ({
            ...task,
            projectName: project.name,
          }));
        } catch {
          return [];
        }
      });

      const tasksArrays = await Promise.all(tasksPromises);
      const tasks = tasksArrays.flat();
      setAllTasks(tasks);
    } catch (err) {
      console.error("Error fetching search data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter results based on search query
  const filteredResults = {
    projects: projects.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    tasks: allTasks.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  };

  const handleSelectProject = (project: Project) => {
    router.push(`/projects/${project.id}`);
    setOpen(false);
    setSearchQuery("");
  };

  const handleSelectTask = (task: Task) => {
    router.push(`/projects/${task.Project}`);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-colors">
          <Search className="h-4 w-4 text-gray-400" />
          <span className="text-left">Search</span>
          <div className="hidden sm:flex items-center gap-0.5 text-xs text-gray-400 ml-2">
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-mono text-[10px]">
              ⌘
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-mono text-[10px]">
              K
            </kbd>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="end" sideOffset={8}>
        <Command className="rounded-lg border-0 shadow-none">
          <CommandInput
            placeholder="Search projects, tasks..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="border-b"
          />
          <CommandList className="max-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <CommandEmpty>No results found.</CommandEmpty>

            {filteredResults.projects.length > 0 && (
              <CommandGroup heading="Projects" className="px-2">
                {filteredResults.projects.slice(0, 5).map((project) => (
                  <CommandItem
                    key={project.id}
                    onSelect={() => handleSelectProject(project)}
                    className="flex items-start gap-2.5 cursor-pointer py-2.5 px-2 rounded-md hover:bg-gray-100 aria-selected:bg-gray-100"
                  >
                    <FolderKanban className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                      <span className="font-medium text-sm text-gray-900 leading-tight">{project.name}</span>
                      {project.description && (
                        <span className="text-xs text-gray-500 line-clamp-1 leading-tight">
                          {project.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredResults.tasks.length > 0 && (
              <CommandGroup heading="Tasks" className="px-2">
                {filteredResults.tasks.slice(0, 8).map((task) => (
                  <CommandItem
                    key={task.taskid}
                    onSelect={() => handleSelectTask(task)}
                    className="flex items-start gap-2.5 cursor-pointer py-2.5 px-2 rounded-md hover:bg-gray-100 aria-selected:bg-gray-100"
                  >
                    <CheckSquare className="h-3.5 w-3.5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                      <span className="font-medium text-sm text-gray-900 leading-tight line-clamp-1">{task.name}</span>
                      <span className="text-xs text-gray-500 leading-tight">
                        {task.projectName || "Unknown Project"}
                      </span>
                    </div>
                    {task.status && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border flex-shrink-0 ${
                        task.status === "completed" ? "bg-gray-800 text-white border-gray-800" :
                        task.status === "active" ? "bg-orange-100 text-orange-800 border-orange-300" :
                        task.status === "created" ? "bg-blue-100 text-blue-800 border-blue-300" :
                        "bg-gray-100 text-gray-800 border-gray-300"
                      }`}>
                        {task.status}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Quick Actions */}
            {!searchQuery && (
              <CommandGroup heading="Quick Actions" className="px-2">
                <CommandItem onSelect={() => { router.push("/projects"); setOpen(false); }} className="cursor-pointer py-2.5 px-2 rounded-md hover:bg-gray-100 aria-selected:bg-gray-100">
                  <FolderKanban className="h-3.5 w-3.5 text-gray-600 mr-2.5" />
                  <span className="text-sm">View All Projects</span>
                </CommandItem>
                <CommandItem onSelect={() => { router.push("/tasks"); setOpen(false); }} className="cursor-pointer py-2.5 px-2 rounded-md hover:bg-gray-100 aria-selected:bg-gray-100">
                  <CheckSquare className="h-3.5 w-3.5 text-gray-600 mr-2.5" />
                  <span className="text-sm">View All Tasks</span>
                </CommandItem>
                <CommandItem onSelect={() => { router.push("/dashboard"); setOpen(false); }} className="cursor-pointer py-2.5 px-2 rounded-md hover:bg-gray-100 aria-selected:bg-gray-100">
                  <Calendar className="h-3.5 w-3.5 text-gray-600 mr-2.5" />
                  <span className="text-sm">Go to Dashboard</span>
                </CommandItem>
              </CommandGroup>
            )}
          </>
        )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

