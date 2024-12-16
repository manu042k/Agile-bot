import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import fileUploadService from "@/services/fileUploadService";

interface Props {
  onSuccess: () => void; // Callback to notify parent on success
}

const ProjectOverviewComponent: React.FC<Props> = ({ onSuccess }) => {
  const location = useLocation();
  const projectId = location.pathname.split("/")[2];
  const [file, setFile] = useState<File | null>(null);
  const [timeline, setTimeline] = useState<number | null>(null);
  const [sprintSize, setSprintSize] = useState<string>("1");
  const [error, setError] = useState<string | null>(null);
  const csrfToken = Cookies.get("csrftoken");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!timeline || isNaN(timeline)) {
      setError("Please enter a valid timeline.");
      return;
    }

    const sprintDuration = parseInt(sprintSize, 10);
    if (timeline <= sprintDuration) {
      setError("Sprint size must be less than the project timeline.");
      return;
    }

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
      formData.append("timeline", timeline.toString());
      formData.append("sprintsize", sprintDuration.toString());
      formData.append("project", projectId); // Use the project ID from the URL
    }

    try {
      await fileUploadService.uploadFile(formData, csrfToken);
      toast.success("File uploaded successfully!");
      setFile(null);
      setTimeline(null);
      setSprintSize("1");
      onSuccess(); // Notify parent about the success
    } catch (error) {
      setError("Error uploading file");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Upload File</Label>
        <Input type="file" id="file" onChange={handleFileChange} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timeline">Timeline (weeks)</Label>
        <Input
          type="number"
          id="timeline"
          value={timeline ?? ""}
          onChange={(e) => setTimeline(Number(e.target.value))}
          placeholder="Enter project timeline in weeks"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sprintSize">Sprint Size</Label>
        <Select
          onValueChange={(value) => setSprintSize(value)}
          value={sprintSize}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a sprint size" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sprint Size</SelectLabel>
              <SelectItem value="1">1 week</SelectItem>
              <SelectItem value="2">2 weeks</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <Button type="submit">Submit</Button>
    </form>
  );
};

export default ProjectOverviewComponent;
