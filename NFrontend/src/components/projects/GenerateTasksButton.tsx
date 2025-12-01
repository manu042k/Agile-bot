"use client";
import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import CreateCard from "@/components/common/CreateCard";
import taskService from "@/services/taskService";
import { useRouter } from "next/navigation";

interface GenerateTasksButtonProps {
  projectId: string;
  onTasksGenerated?: () => void;
  hasTeam?: boolean;
}

const GenerateTasksButton: React.FC<GenerateTasksButtonProps> = ({
  projectId,
  onTasksGenerated,
  hasTeam = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "error">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [requiresUpload, setRequiresUpload] = useState(false);
  const [tasksCreated, setTasksCreated] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const router = useRouter();

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, "") || "localhost:8000"}/ws/task-generation/${projectId}/`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("WebSocket connected for task generation");
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "progress") {
        setProgress(data.progress);
        setMessage(data.message);
        setStatus(data.status);
        
        if (data.status === "completed") {
          setIsGenerating(false);
          setTasksCreated(data.data?.tasks || []);
          if (onTasksGenerated) {
            onTasksGenerated();
          }
        } else if (data.status === "error") {
          setIsGenerating(false);
          setError(data.message);
        }
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Connection error. Please try again.");
      setIsGenerating(false);
    };
    
    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };
    
    wsRef.current = ws;
  };

  const startGeneration = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      setStatus("processing");
      setMessage("Initializing task generation...");
      setError(null);
      setRequiresUpload(false);
      setTasksCreated([]);

      // Connect to WebSocket for progress updates
      connectWebSocket();

      // Start task generation
      const response = await taskService.generateTasks(projectId);
      
      // WebSocket will handle progress updates
      console.log("Task generation started:", response);
      
    } catch (err: any) {
      setIsGenerating(false);
      setStatus("error");
      
      if (err.response?.data?.requires_upload) {
        setRequiresUpload(true);
        setError(err.response.data.message || "Please upload a requirements document first.");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to generate tasks");
      }
      
      // Close WebSocket on error
      if (wsRef.current) {
        wsRef.current.close();
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    
    // Check if team is assigned before starting generation
    if (open && status === "idle") {
      if (!hasTeam) {
        setStatus("error");
        setError("Please assign a team to this project before generating tasks.");
        return;
      }
      startGeneration();
    }
    
    // Cleanup when dialog closes
    if (!open) {
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      // Reset state after a delay
      setTimeout(() => {
        setProgress(0);
        setStatus("idle");
        setMessage("");
        setError(null);
        setRequiresUpload(false);
        setTasksCreated([]);
      }, 300);
    }
  };

  const handleViewTasks = () => {
    setIsOpen(false);
    router.push(`/projects/${projectId}/tasks`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <CreateCard
          title="Generate Tasks"
          description={hasTeam ? "AI-powered" : "Assign team first"}
          icon={Sparkles}
          className={!hasTeam ? "opacity-60 cursor-not-allowed" : ""}
        />
      </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {status === "completed" ? "Tasks Generated!" : 
               status === "error" ? "Generation Failed" : 
               "Generating Tasks"}
            </DialogTitle>
            <DialogDescription>
              {status === "completed" 
                ? `Successfully created ${tasksCreated.length} tasks for your project.`
                : status === "error"
                ? "There was an issue generating tasks."
                : "AI is analyzing your requirements and creating tasks..."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Progress Bar */}
            {status === "processing" && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{message}</span>
                </div>
              </div>
            )}

            {/* Success State */}
            {status === "completed" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">{message}</span>
                </div>
                
                {tasksCreated.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <p className="text-sm font-medium text-gray-700 mb-2">Created Tasks:</p>
                    <ul className="space-y-1">
                      {tasksCreated.map((task) => (
                        <li key={task.taskid} className="text-sm text-gray-600">
                          • {task.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Error State */}
            {status === "error" && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{error || "An error occurred"}</p>
                  </div>
                </div>

                {requiresUpload && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Upload className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-900 mb-1">
                          Requirements Document Needed
                        </p>
                        <p className="text-sm text-orange-700">
                          Please upload a requirements document before generating tasks.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {status === "completed" && (
              <>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Close
                </Button>
                <Button onClick={handleViewTasks} className="bg-orange-600 hover:bg-orange-700">
                  View Tasks
                </Button>
              </>
            )}
            
            {status === "error" && (
              <>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Close
                </Button>
                {!requiresUpload && (
                  <Button onClick={startGeneration} className="bg-orange-600 hover:bg-orange-700">
                    Try Again
                  </Button>
                )}
              </>
            )}
            
            {status === "processing" && (
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isGenerating}>
                Cancel
              </Button>
            )}
          </div>
        </DialogContent>
    </Dialog>
  );
};

export default GenerateTasksButton;
