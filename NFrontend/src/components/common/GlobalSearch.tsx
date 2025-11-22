"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Search, FolderKanban, CheckSquare, Users, FileText, Calendar } from "lucide-react";

// Mock search data
const mockSearchResults = {
  projects: [
    { id: 1, name: "E-Commerce Platform", type: "project" },
    { id: 2, name: "Mobile Banking App", type: "project" },
    { id: 3, name: "AI Analytics Dashboard", type: "project" },
  ],
  tasks: [
    { id: 1, name: "Implement user authentication", project: "E-Commerce Platform", type: "task" },
    { id: 2, name: "Design dashboard UI", project: "Analytics Dashboard", type: "task" },
    { id: 3, name: "Write API documentation", project: "Mobile Banking App", type: "task" },
  ],
  teams: [
    { id: 1, name: "Frontend Team", type: "team" },
    { id: 2, name: "Backend Team", type: "team" },
  ],
  documents: [
    { id: 1, name: "Project Requirements.pdf", project: "E-Commerce Platform", type: "document" },
    { id: 2, name: "Technical Specification.docx", project: "Mobile Banking App", type: "document" },
  ],
};

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter results based on search query
  const filteredResults = {
    projects: mockSearchResults.projects.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    tasks: mockSearchResults.tasks.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.project.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    teams: mockSearchResults.teams.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    documents: mockSearchResults.documents.filter((d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.project.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  };

  const handleSelect = (item: any) => {
    if (item.type === "project") {
      router.push(`/projects/${item.id}`);
    } else if (item.type === "task") {
      router.push(`/projects/${item.id}/task/${item.id}`);
    } else if (item.type === "team") {
      router.push(`/teams/${item.id}`);
    } else if (item.type === "document") {
      router.push(`/documents`);
    }
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search projects, tasks, teams, documents..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {filteredResults.projects.length > 0 && (
          <CommandGroup heading="Projects">
            {filteredResults.projects.map((project) => (
              <CommandItem
                key={project.id}
                onSelect={() => handleSelect(project)}
                className="flex items-center gap-3"
              >
                <FolderKanban className="h-4 w-4 text-gray-600" />
                <span>{project.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredResults.tasks.length > 0 && (
          <CommandGroup heading="Tasks">
            {filteredResults.tasks.map((task) => (
              <CommandItem
                key={task.id}
                onSelect={() => handleSelect(task)}
                className="flex items-center gap-3"
              >
                <CheckSquare className="h-4 w-4 text-gray-600" />
                <div className="flex flex-col">
                  <span>{task.name}</span>
                  <span className="text-xs text-gray-500">{task.project}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredResults.teams.length > 0 && (
          <CommandGroup heading="Teams">
            {filteredResults.teams.map((team) => (
              <CommandItem
                key={team.id}
                onSelect={() => handleSelect(team)}
                className="flex items-center gap-3"
              >
                <Users className="h-4 w-4 text-gray-600" />
                <span>{team.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredResults.documents.length > 0 && (
          <CommandGroup heading="Documents">
            {filteredResults.documents.map((doc) => (
              <CommandItem
                key={doc.id}
                onSelect={() => handleSelect(doc)}
                className="flex items-center gap-3"
              >
                <FileText className="h-4 w-4 text-gray-600" />
                <div className="flex flex-col">
                  <span>{doc.name}</span>
                  <span className="text-xs text-gray-500">{doc.project}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => { router.push("/projects"); onOpenChange(false); }}>
            <FolderKanban className="h-4 w-4 text-gray-600" />
            <span>Create Project</span>
          </CommandItem>
          <CommandItem onSelect={() => { router.push("/tasks"); onOpenChange(false); }}>
            <CheckSquare className="h-4 w-4 text-gray-600" />
            <span>Create Task</span>
          </CommandItem>
          <CommandItem onSelect={() => { router.push("/dashboard"); onOpenChange(false); }}>
            <Calendar className="h-4 w-4 text-gray-600" />
            <span>Go to Dashboard</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

