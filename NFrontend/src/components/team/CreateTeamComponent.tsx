import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import toast from "react-hot-toast";
import teamService from "@/services/teamService";

const CreateTeamComponent = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleCreateTeam = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const newTeam = { name, description };

      await teamService.createTeam(newTeam);
      toast.success("Team created successfully!");
      setName("");
      setDescription("");
      window.location.reload();
    } catch (error: any) {
      setError("Failed to create Team. Please try again.");
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[800px]">
      <DialogHeader>
        <DialogTitle>Create Team</DialogTitle>
        <DialogDescription>
          Fill in the details to create a new team.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label
            htmlFor="project-name"
            className="text-right block truncate font-semibold"
          >
            Team Name
          </Label>
          <Input
            id="project-name"
            placeholder="Enter project name"
            className="col-span-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label
            htmlFor="project-desc"
            className="text-right block truncate font-semibold"
          >
            Description
          </Label>
          <Textarea
            id="project-desc"
            className="col-span-3"
            placeholder="Type your message here."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <DialogFooter>
        <form onSubmit={handleCreateTeam}>
          <Button type="submit">Create</Button>
        </form>
      </DialogFooter>
    </DialogContent>
  );
};

export default CreateTeamComponent;
