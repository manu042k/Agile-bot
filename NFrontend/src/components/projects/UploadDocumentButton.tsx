"use client";
import { useState } from "react";
import { Upload } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import UploadDocumentComponent from "./UploadDocumentComponent";
import CreateCard from "@/components/common/CreateCard";
import toast from "react-hot-toast";

interface UploadDocumentButtonProps {
  projectId: string;
  onSuccess?: () => void;
  description?: string;
  className?: string;
}

const UploadDocumentButton: React.FC<UploadDocumentButtonProps> = ({
  projectId,
  onSuccess,
  description = "Requirements & specs",
  className = "",
}) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleSuccess = () => {
    setUploadDialogOpen(false);
    toast.success("Documents uploaded successfully!");
    onSuccess?.();
  };

  return (
    <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
      <DialogTrigger asChild>
        <CreateCard
          title="Upload Documents"
          description={description}
          icon={Upload}
          className={className}
        />
      </DialogTrigger>
      <UploadDocumentComponent
        projectId={projectId}
        onClose={() => setUploadDialogOpen(false)}
        onSuccess={handleSuccess}
      />
    </Dialog>
  );
};

export default UploadDocumentButton;

