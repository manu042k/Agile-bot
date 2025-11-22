"use client";
import { useState } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X } from "lucide-react";
import toast from "react-hot-toast";

interface UploadDocumentComponentProps {
  projectId?: string;
  onClose?: () => void;
}

const UploadDocumentComponent: React.FC<UploadDocumentComponentProps> = ({
  projectId,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`Document "${file.name}" uploaded successfully`);
      setFile(null);
      setCategory("");
      onClose?.();
    } catch (err: any) {
      setError("Failed to upload document. Please try again.");
      toast.error("Failed to upload document");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900">
          Upload Document
        </DialogTitle>
        <DialogDescription className="text-gray-600">
          Upload a document to this {projectId ? "project" : "workspace"}.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleUpload} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="document-file" className="text-sm font-medium text-gray-700">
            Select File
          </Label>
          <div className="relative">
            <input
              id="document-file"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.png,.jpg,.jpeg"
            />
            <label
              htmlFor="document-file"
              className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {file ? (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Click to select or drag and drop
                  </span>
                </>
              )}
            </label>
          </div>
          {file && (
            <p className="text-xs text-gray-500">
              File size: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="document-category" className="text-sm font-medium text-gray-700">
            Category <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <Input
            id="document-category"
            placeholder="e.g., Requirements, Design, Documentation"
            className="pm-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="submit"
            className="pm-button-primary w-full sm:w-auto"
            disabled={isLoading || !file}
          >
            {isLoading ? "Uploading..." : "Upload Document"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default UploadDocumentComponent;

