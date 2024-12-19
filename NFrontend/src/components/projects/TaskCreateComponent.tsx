import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import {
  CreatedBy,
  Task,
  TaskPriority,
  TaskSize,
  TaskStatus,
} from "@/types/project";
import taskService from "@/services/taskService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface props {
  projectId: string;
  onClose: () => void; // Callback to handle closing the dialog
}

const TaskCreateComponent: React.FC<props> = ({ projectId, onClose }) => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<Task>();

  const onSubmit = async (data: Task) => {
    const processedData = {
      ...data,
      created_by: CreatedBy.USER,
      status: TaskStatus.Created,
      Project: projectId,
    };

    try {
      await taskService.createTask(processedData);
      toast.success("Task created successfully!");
      onClose(); // Trigger close on success
      navigate(0);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to create task. Please try again");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>Create a New Task</DialogTitle>
        <DialogDescription>
          Fill out the details to create a new task.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 p-4">
        {/* Task Name */}
        <div>
          <Label htmlFor="name">Task Name</Label>
          <Input
            id="name"
            placeholder="Enter task name"
            {...register("name", { required: true })}
          />
        </div>
        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="Enter description"
            {...register("description", { required: true })}
          />
        </div>
        {/* Details */}
        <div>
          <Label htmlFor="details">Details</Label>
          <Input
            id="details"
            placeholder="Enter details"
            {...register("details")}
          />
        </div>
        {/* Priority */}
        <div>
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            {...register("priority", { required: true })}
            className="w-full rounded-md border border-gray-300 p-2"
          >
            {Object.values(TaskPriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
        {/* Size */}
        <div>
          <Label htmlFor="size">Size</Label>
          <select
            id="size"
            {...register("size", { required: true })}
            className="w-full rounded-md border border-gray-300 p-2"
          >
            {Object.values(TaskSize).map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">Confirm</Button>
        <DialogClose hidden onClick={onClose} /> {/* Optional close button */}
      </DialogFooter>
    </form>
  );
};

export default TaskCreateComponent;
