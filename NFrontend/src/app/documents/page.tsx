"use client";
import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  File,
  FileCode,
  FileSpreadsheet,
  Image,
  FileType,
  ChevronDown,
  ChevronUp,
  Loader2,
  FolderKanban,
  FileCode2,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Separator } from "@/components/ui/separator";
import ActivityFeed from "@/components/common/ActivityFeed";
import DocumentPreviewDialog from "@/components/projects/DocumentPreviewDialog";
import documentService, { Document } from "@/services/documentService";
import toast from "react-hot-toast";
import Link from "next/link";
import StatCard from "@/components/common/StatCard";

const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined || bytes === null) return "Unknown";
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

const DocumentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set()
  );
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [documentToPreview, setDocumentToPreview] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentService.getAllDocuments();
      setDocuments(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch documents");
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const toggleProject = (project: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(project)) {
        newSet.delete(project);
      } else {
        newSet.add(project);
      }
      return newSet;
    });
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      (doc.project_name && doc.project_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getFileIcon = (fileName: string) => {
    const iconClass = "h-5 w-5";
    const extension = getFileExtension(fileName);
    switch (extension) {
      case "pdf":
        return <FileText className={iconClass} style={{ color: "#DC2626" }} />; // Red
      case "doc":
      case "docx":
        return <File className={iconClass} style={{ color: "#2563EB" }} />; // Blue
      case "xlsx":
      case "xls":
        return (
          <FileSpreadsheet className={iconClass} style={{ color: "#16A34A" }} />
        ); // Green
      case "md":
        return <FileCode className={iconClass} style={{ color: "#7C3AED" }} />; // Purple
      case "sql":
        return <FileCode className={iconClass} style={{ color: "#EA580C" }} />; // Orange
      case "fig":
        return <Image className={iconClass} style={{ color: "#9333EA" }} />; // Purple
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
        return <Image className={iconClass} style={{ color: "#9333EA" }} />; // Purple
      default:
        return <FileType className={iconClass} style={{ color: "#6B7280" }} />; // Gray
    }
  };

  const getFileIconBg = (fileName: string) => {
    const extension = getFileExtension(fileName);
    switch (extension) {
      case "pdf":
        return "bg-red-100";
      case "doc":
      case "docx":
        return "bg-blue-100";
      case "xlsx":
      case "xls":
        return "bg-green-100";
      case "md":
        return "bg-purple-100";
      case "sql":
        return "bg-orange-100";
      case "fig":
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
        return "bg-purple-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Documents"
        description="Manage project documents and files across all your projects"
        icon={FileText}
        showTabs={false}
        searchPlaceholder="Search documents..."
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Documents Overview */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Documents Overview
              </h2>
              <Separator className="my-4" />
              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  icon={FileText}
                  value={documents.length}
                  label="Total Documents"
                  className="p-0 border-0 shadow-none bg-transparent"
                  iconBgColor="bg-blue-100"
                  iconColor="text-blue-600"
                />
                <StatCard
                  icon={FolderKanban}
                  value={new Set(documents.map((d) => d.project_name).filter(Boolean)).size}
                  label="Projects"
                  className="p-0 border-0 shadow-none bg-transparent"
                  iconBgColor="bg-purple-100"
                  iconColor="text-purple-600"
                />
                <StatCard
                  icon={FileCode2}
                  value={new Set(documents.map((d) => getFileExtension(d.name)).filter(Boolean)).size}
                  label="File Types"
                  className="p-0 border-0 shadow-none bg-transparent"
                  iconBgColor="bg-orange-100"
                  iconColor="text-orange-600"
                />
              </div>
            </div>

            {/* Documents by Project */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Documents by Project
              </h2>
              <Separator className="my-4" />
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              ) : Array.from(new Set(filteredDocuments.map((d) => d.project_name).filter(Boolean)))
                .length > 0 ? (
                <div className="space-y-6">
                  {Array.from(
                    new Set(filteredDocuments.map((d) => d.project_name).filter(Boolean))
                  ).map((projectName) => {
                    const projectDocs = filteredDocuments.filter(
                      (d) => d.project_name === projectName
                    );
                    const projectId = projectDocs[0]?.project;
                    const isExpanded = expandedProjects.has(projectName);
                    const hasMoreThanThree = projectDocs.length > 3;
                    const displayDocs =
                      hasMoreThanThree && !isExpanded
                        ? projectDocs.slice(0, 3)
                        : projectDocs;
                    const remainingCount = projectDocs.length - 3;

                    return (
                      <div
                        key={projectName}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Link 
                            href={projectId ? `/projects/${projectId}` : '#'}
                            className="font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                          >
                            {projectName}
                          </Link>
                          {hasMoreThanThree && (
                            <button
                              onClick={() => toggleProject(projectName)}
                              className="flex items-center gap-1 text-sm text-gray-600 transition-colors px-2 py-1 rounded hover:bg-orange-50"
                            >
                              <span>
                                {isExpanded
                                  ? "Show less"
                                  : `Show ${remainingCount} more`}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {displayDocs.map((doc) => (
                            <div
                              key={doc.id}
                              onClick={() => {
                                setDocumentToPreview(doc);
                                setPreviewDialogOpen(true);
                              }}
                              className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div
                                  className={`w-10 h-10 rounded-lg ${getFileIconBg(
                                    doc.name
                                  )} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
                                >
                                  {getFileIcon(doc.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm transition-colors truncate">
                                    {doc.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString()} • {doc.uploaded_by_email || "Unknown"}
                                  </p>
                                </div>
                              </div>
                              {doc.file_url && (
                                <a
                                  href={doc.file_url}
                                  download
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 rounded-lg hover:bg-orange-100 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Download className="h-4 w-4 text-gray-600 transition-colors" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="relative mx-auto mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <FileText className="h-12 w-12 text-orange-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery ? "No documents found" : "No documents yet"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
                    {searchQuery
                      ? "Try adjusting your search query or clear filters to see more results"
                      : "No documents available. Documents are managed within individual projects."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <ActivityFeed limit={5} />
          </div>
        </div>

        {/* Document Preview Dialog */}
        <DocumentPreviewDialog
          document={documentToPreview}
          open={previewDialogOpen}
          onOpenChange={setPreviewDialogOpen}
        />
      </div>
    </div>
  );
};

export default DocumentsPage;
