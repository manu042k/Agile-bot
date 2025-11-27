"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Loader2, FileText } from "lucide-react";
import { Document } from "@/services/documentService";
import { URLS } from "@/types/url-constants";

interface DocumentPreviewDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Ensure file URL is absolute
const getFileUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;

  // If URL is already absolute (starts with http:// or https://), use it as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If URL is relative, prepend BASE_URL
  return `${URLS.BASE_URL}${url.startsWith("/") ? url.slice(1) : url}`;
};

const DocumentPreviewDialog: React.FC<DocumentPreviewDialogProps> = ({
  document,
  open,
  onOpenChange,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string>("");
  const [textLoading, setTextLoading] = useState(true);

  const getFileExtension = (fileName: string): string => {
    return fileName.split(".").pop()?.toLowerCase() || "";
  };

  useEffect(() => {
    if (open && document) {
      setLoading(true);
      setError(null);
      setTextContent("");
      setTextLoading(true);

      const extension = getFileExtension(document.name);
      const isText = ["txt", "md", "json", "xml", "csv", "log"].includes(
        extension
      );
      const isImage = ["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(
        extension
      );
      const isPDF = extension === "pdf";
      const isOfficeDoc = [
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
      ].includes(extension);

      // Fetch text files
      if (isText && document.file_url) {
        const fileUrl = getFileUrl(document.file_url);
        if (!fileUrl) {
          setError("File URL not available");
          setTextLoading(false);
          setLoading(false);
          return;
        }

        fetch(fileUrl, {
          credentials: "include", // Include cookies for authentication
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.text();
          })
          .then((text) => {
            setTextContent(text);
            setTextLoading(false);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Text file fetch error:", err, fileUrl);
            setError(
              "Failed to load text file. Please try downloading it instead."
            );
            setTextLoading(false);
            setLoading(false);
          });
      } else if (isOfficeDoc || (!isText && !isImage && !isPDF)) {
        // For office docs and unknown types, no loading needed
        setTextLoading(false);
        setLoading(false);
      } else {
        // For images and PDFs, show loading initially
        // They will handle their own loading states via onLoad events
        setTextLoading(false);
        // Keep loading true initially, will be set to false by onLoad or timeout
        setLoading(true);

        // Set a timeout fallback - if content doesn't load in 10 seconds, show error
        const timeout = setTimeout(() => {
          setLoading((prevLoading) => {
            if (prevLoading) {
              setError(
                "The document is taking too long to load. Please try downloading it instead."
              );
              return false;
            }
            return prevLoading;
          });
        }, 10000);

        return () => clearTimeout(timeout);
      }
    } else if (!open) {
      // Reset when dialog closes
      setLoading(false);
      setTextLoading(false);
      setError(null);
      setTextContent("");
    }
  }, [open, document]);

  if (!document) return null;

  const extension = getFileExtension(document.name);
  const isImage = ["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(
    extension
  );
  const isPDF = extension === "pdf";
  const isText = ["txt", "md", "json", "xml", "csv", "log"].includes(extension);
  const isOfficeDoc = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(
    extension
  );

  const renderPreview = () => {
    const fileUrl = getFileUrl(document.file_url);

    if (!fileUrl) {
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">File URL not available</p>
        </div>
      );
    }

    console.log("Preview file URL:", fileUrl);

    if (isImage) {
      return (
        <div className="flex items-center justify-center bg-gray-50 p-4 min-h-[400px] relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-50">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
          <img
            src={fileUrl}
            alt={document.name}
            crossOrigin="use-credentials"
            className={`max-w-full max-h-[70vh] object-contain rounded-lg ${
              loading ? "opacity-0" : "opacity-100"
            } transition-opacity`}
            onLoad={() => {
              console.log("Image loaded successfully");
              setLoading(false);
            }}
            onError={(e) => {
              console.error("Image load error:", e, fileUrl);
              setLoading(false);
              setError(
                "Failed to load image. The file may be corrupted, inaccessible, or require authentication. Please try downloading it instead."
              );
            }}
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="w-full h-[70vh] bg-gray-50 rounded-lg overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading PDF...</p>
                <p className="text-xs text-gray-400 mt-2">
                  If this takes too long, try downloading the file
                </p>
              </div>
            </div>
          )}
          <object
            data={`${fileUrl}#toolbar=1`}
            type="application/pdf"
            className={`w-full h-full ${
              loading ? "opacity-0" : "opacity-100"
            } transition-opacity`}
            onLoad={() => {
              console.log("PDF object loaded successfully");
              setLoading(false);
            }}
            onError={() => {
              console.error("PDF object load error:", fileUrl);
              setLoading(false);
              setError(
                "Failed to load PDF. The file may be corrupted, inaccessible, or require authentication. Please try downloading it instead."
              );
            }}
            style={{ minHeight: "600px" }}
          >
            <div className="flex flex-col items-center justify-center h-full p-8">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Unable to display PDF in browser
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Please download the file to view it
              </p>
              <a
                href={fileUrl}
                download
                className="pm-button-primary inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            </div>
          </object>
        </div>
      );
    }

    if (isText) {
      if (textLoading || loading) {
        return (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        );
      }

      return (
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[70vh] font-mono text-sm">
          <pre className="whitespace-pre-wrap">{textContent}</pre>
        </div>
      );
    }

    if (isOfficeDoc) {
      return (
        <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg p-8">
          <FileText className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">
            Office documents cannot be previewed
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Please download the file to view it
          </p>
          <a
            href={document.file_url}
            download
            className="pm-button-primary inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        </div>
      );
    }

    // Default: Show download option
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg p-8">
        <FileText className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">
          Preview not available for this file type
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Please download the file to view it
        </p>
        <a
          href={document.file_url}
          download
          className="pm-button-primary inline-flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </a>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pr-12">
          <DialogTitle className="text-xl font-bold text-gray-900 truncate">
            {document.name}
          </DialogTitle>
        </DialogHeader>

        {/* Action buttons aligned with default close button */}
        {document.file_url && (
          <div className="absolute right-12 top-4 z-10">
            <a
              href={document.file_url}
              download
              className="p-2 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <Download className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Download</span>
            </a>
          </div>
        )}

        <div className="flex-1 overflow-auto mt-4">
          {error ? (
            <div className="flex flex-col items-center justify-center h-96">
              <p className="text-red-600 mb-4">{error}</p>
              {document.file_url && (
                <a
                  href={document.file_url}
                  download
                  className="pm-button-primary inline-flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Instead
                </a>
              )}
            </div>
          ) : (
            renderPreview()
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewDialog;
