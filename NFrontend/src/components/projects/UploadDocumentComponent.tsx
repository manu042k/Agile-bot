"use client";
import { useState } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, X } from "lucide-react";
import toast from "react-hot-toast";
import documentService from "@/services/documentService";

interface UploadDocumentComponentProps {
  projectId?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

const CATEGORY_OPTIONS = [
  "Requirements",
  "Design",
  "Documentation",
  "Specifications",
  "Meeting Notes",
  "Reports",
  "Code",
  "Assets",
  "Other",
];

const UploadDocumentComponent: React.FC<UploadDocumentComponentProps> = ({
  projectId,
  onClose,
  onSuccess,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<string>("none");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!projectId) {
      setError("Project ID is required");
      return;
    }

    if (files.length === 0) {
      setError("Please select at least one file to upload");
      return;
    }

    setIsLoading(true);

    try {
      const result = await documentService.uploadDocuments(
        projectId,
        files,
        category && category !== "none" ? category : undefined
      );
      
      toast.success(
        result.message || `Successfully uploaded ${files.length} document(s)`
      );
      setFiles([]);
      setCategory("none");
      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to upload documents. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900">
          Upload Documents
        </DialogTitle>
        <DialogDescription className="text-gray-600">
          Upload one or multiple documents to this {projectId ? "project" : "workspace"}.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleUpload} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="document-file" className="text-sm font-medium text-gray-700">
            Select Files {files.length > 0 && `(${files.length} selected)`}
          </Label>
          <div className="relative">
            <input
              id="document-file"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.png,.jpg,.jpeg,.gif,.svg"
            />
            <label
              htmlFor="document-file"
              className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Upload className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Click to select files or drag and drop
              </span>
            </label>
          </div>
          
          {files.length > 0 && (
            <div className="space-y-2 mt-3 max-h-48 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 rounded hover:bg-gray-200 flex-shrink-0"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="document-category" className="text-sm font-medium text-gray-700">
            Category <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="document-category" className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="submit"
            className="pm-button-primary w-full sm:w-auto"
            disabled={isLoading || files.length === 0}
          >
            {isLoading
              ? `Uploading ${files.length} file(s)...`
              : `Upload ${files.length > 0 ? `${files.length} ` : ""}Document${files.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default UploadDocumentComponent;

