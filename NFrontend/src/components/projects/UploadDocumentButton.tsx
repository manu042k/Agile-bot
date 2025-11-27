"use client";
import { useState } from "react";
import { Upload } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import UploadDocumentComponent from "./UploadDocumentComponent";
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
        <button
          className={`bg-white border border-orange-200 rounded-lg p-5 shadow-sm hover:shadow-orange-500/20 hover:border-orange-300 transition-all text-left w-full group ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
              <Upload className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-0.5">
                Upload Documents
              </h3>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>
        </button>
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

