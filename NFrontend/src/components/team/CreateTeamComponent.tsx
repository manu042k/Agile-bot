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
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900">Create Team</DialogTitle>
        <DialogDescription className="text-gray-600">
          Fill in the details to create a new team.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleCreateTeam} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="team-name" className="text-sm font-medium text-gray-700">
            Team Name
          </Label>
          <Input
            id="team-name"
            placeholder="Enter team name"
            className="pm-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="team-desc" className="text-sm font-medium text-gray-700">
            Description
          </Label>
          <Textarea
            id="team-desc"
            className="pm-input min-h-[100px]"
            placeholder="Enter team description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="submit" className="pm-button-primary w-full sm:w-auto">
            Create Team
          </Button>
        </DialogFooter>
        </form>
    </DialogContent>
  );
};

export default CreateTeamComponent;
