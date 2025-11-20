"use client";
import { useState } from "react";
import { Plus, Search, Filter, MoreVertical, User, Calendar, Flag } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import TaskCreateComponent from "@/components/projects/TaskCreateComponent";

// Mock tasks data
const mockTasks = {
  backlog: [
    {
      id: 1,
      title: "Design user authentication flow",
      description: "Create wireframes and mockups for login and registration",
      assignee: "John Doe",
      priority: "high",
      dueDate: "2024-02-15",
      tags: ["Design", "UX"]
    },
    {
      id: 2,
      title: "Set up CI/CD pipeline",
      description: "Configure GitHub Actions for automated testing and deployment",
      assignee: "Jane Smith",
      priority: "medium",
      dueDate: "2024-02-20",
      tags: ["DevOps"]
    }
  ],
  todo: [
    {
      id: 3,
      title: "Implement REST API endpoints",
      description: "Create endpoints for user management and authentication",
      assignee: "Mike Johnson",
      priority: "high",
      dueDate: "2024-02-18",
      tags: ["Backend", "API"]
    },
    {
      id: 4,
      title: "Write unit tests",
      description: "Add comprehensive test coverage for core functionality",
      assignee: "Sarah Wilson",
      priority: "medium",
      dueDate: "2024-02-22",
      tags: ["Testing"]
    }
  ],
  in_progress: [
    {
      id: 5,
      title: "Build dashboard UI",
      description: "Create responsive dashboard with charts and analytics",
      assignee: "Alex Brown",
      priority: "high",
      dueDate: "2024-02-16",
      tags: ["Frontend", "UI"]
    },
    {
      id: 6,
      title: "Database schema design",
      description: "Design and implement database structure",
      assignee: "Chris Lee",
      priority: "high",
      dueDate: "2024-02-17",
      tags: ["Database"]
    }
  ],
  done: [
    {
      id: 7,
      title: "Project setup and configuration",
      description: "Initialize project structure and install dependencies",
      assignee: "John Doe",
      priority: "low",
      dueDate: "2024-02-10",
      tags: ["Setup"]
    },
    {
      id: 8,
      title: "Create project documentation",
      description: "Write README and setup guides",
      assignee: "Jane Smith",
      priority: "medium",
      dueDate: "2024-02-12",
      tags: ["Documentation"]
    }
  ]
};

const TaskPage = ({ params }: { params: { projectId: string } }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState(mockTasks);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "pm-priority-high";
      case "medium":
        return "pm-priority-medium";
      case "low":
        return "pm-priority-low";
      default:
        return "pm-badge";
    }
  };

  const columns = [
    { id: "backlog", title: "Backlog", count: tasks.backlog.length, color: "bg-gray-200" },
    { id: "todo", title: "To Do", count: tasks.todo.length, color: "bg-gray-300" },
    { id: "in_progress", title: "In Progress", count: tasks.in_progress.length, color: "bg-gray-400" },
    { id: "done", title: "Done", count: tasks.done.length, color: "bg-gray-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="sticky top-16 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage and track project tasks</p>
            </div>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="pm-button-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </button>
                </DialogTrigger>
                <TaskCreateComponent projectId={params.projectId} onClose={() => {}} />
              </Dialog>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pm-input pl-10 w-full"
              />
            </div>
            <button className="pm-button-secondary">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-4 gap-4">
          {columns.map((column) => {
            const columnTasks = tasks[column.id as keyof typeof tasks];
            return (
              <div key={column.id} className="flex flex-col">
                {/* Column Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${column.color}`} />
                      <h3 className="font-semibold text-gray-900">{column.title}</h3>
                    </div>
                    <span className="pm-badge bg-gray-100 text-gray-700 border-gray-200">
                      {column.count}
                    </span>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-3 flex-1 min-h-0">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className="pm-card p-4 cursor-pointer hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm flex-1 group-hover:text-gray-950 transition-colors">
                          {task.title}
                        </h4>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                        {task.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {task.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-medium">
                            {task.assignee.charAt(0)}
                          </div>
                          <span className="text-xs text-gray-500">{task.assignee}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`pm-badge ${getPriorityColor(task.priority)}`}>
                            <Flag className="h-3 w-3 mr-1" />
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Task Button */}
                  <button className="pm-card p-3 text-center text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all border-dashed">
                    <Plus className="h-4 w-4 mx-auto mb-1" />
                    Add task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
