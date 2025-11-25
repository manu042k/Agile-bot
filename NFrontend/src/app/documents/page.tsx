"use client";
import { useState } from "react";
import {
  Upload,
  FileText,
  Search,
  Download,
  Plus,
  File,
  FileCode,
  FileSpreadsheet,
  Image,
  FileType,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import PageHeader from "@/components/common/PageHeader";
import UploadDocumentComponent from "@/components/projects/UploadDocumentComponent";
import { Separator } from "@/components/ui/separator";
import ActivityFeed from "@/components/common/ActivityFeed";

// Mock documents
const mockDocuments = [
  {
    id: 1,
    name: "Project Requirements.pdf",
    project: "E-Commerce Platform",
    uploadedBy: "John Doe",
    uploadedAt: "2024-02-10",
    size: "2.4 MB",
    type: "pdf",
  },
  {
    id: 2,
    name: "Technical Specification.docx",
    project: "Mobile Banking App",
    uploadedBy: "Jane Smith",
    uploadedAt: "2024-02-08",
    size: "1.8 MB",
    type: "doc",
  },
  {
    id: 3,
    name: "Design Mockups.fig",
    project: "AI Analytics Dashboard",
    uploadedBy: "Mike Johnson",
    uploadedAt: "2024-02-05",
    size: "5.2 MB",
    type: "fig",
  },
  {
    id: 4,
    name: "API Documentation.md",
    project: "E-Commerce Platform",
    uploadedBy: "Sarah Wilson",
    uploadedAt: "2024-02-03",
    size: "0.5 MB",
    type: "md",
  },
  {
    id: 5,
    name: "Database Schema.sql",
    project: "Mobile Banking App",
    uploadedBy: "Alex Brown",
    uploadedAt: "2024-02-01",
    size: "0.3 MB",
    type: "sql",
  },
  {
    id: 6,
    name: "User Stories.xlsx",
    project: "AI Analytics Dashboard",
    uploadedBy: "Chris Lee",
    uploadedAt: "2024-01-28",
    size: "0.9 MB",
    type: "xlsx",
  },
];

const DocumentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set()
  );

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

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getFileIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    switch (type.toLowerCase()) {
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
      default:
        return <FileType className={iconClass} style={{ color: "#6B7280" }} />; // Gray
    }
  };

  const getFileIconBg = (type: string) => {
    switch (type.toLowerCase()) {
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
            {/* Add Document Button and Documents Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Document Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="bg-white border border-orange-200 rounded-lg p-5 shadow-sm hover:shadow-orange-500/20 hover:border-orange-300 transition-all text-left w-full group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                        <Plus className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-0.5">
                          Add Document
                        </h3>
                        <p className="text-xs text-gray-500">New document</p>
                      </div>
                    </div>
                  </button>
                </DialogTrigger>
                <UploadDocumentComponent />
              </Dialog>

              {/* Documents Overview */}
              <div className="pm-card p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Documents Overview
                </h2>
                <Separator className="my-4" />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {mockDocuments.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Total Documents
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {new Set(mockDocuments.map((d) => d.project)).size}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Projects</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {new Set(mockDocuments.map((d) => d.type)).size}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">File Types</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents by Project */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Documents by Project
              </h2>
              <Separator className="my-4" />
              {Array.from(new Set(filteredDocuments.map((d) => d.project)))
                .length > 0 ? (
                <div className="space-y-6">
                  {Array.from(
                    new Set(filteredDocuments.map((d) => d.project))
                  ).map((project) => {
                    const projectDocs = filteredDocuments.filter(
                      (d) => d.project === project
                    );
                    const isExpanded = expandedProjects.has(project);
                    const hasMoreThanThree = projectDocs.length > 3;
                    const displayDocs =
                      hasMoreThanThree && !isExpanded
                        ? projectDocs.slice(0, 3)
                        : projectDocs;
                    const remainingCount = projectDocs.length - 3;

                    return (
                      <div
                        key={project}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">
                            {project}
                          </h3>
                          {hasMoreThanThree && (
                            <button
                              onClick={() => toggleProject(project)}
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
                              className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div
                                  className={`w-10 h-10 rounded-lg ${getFileIconBg(
                                    doc.type
                                  )} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
                                >
                                  {getFileIcon(doc.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm transition-colors truncate">
                                    {doc.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {doc.size} • {doc.uploadedAt}
                                  </p>
                                </div>
                              </div>
                              <button className="p-2 rounded-lg hover:bg-orange-100 transition-colors opacity-0 group-hover:opacity-100">
                                <Download className="h-4 w-4 text-gray-600 transition-colors" />
                              </button>
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
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center">
                      <Plus className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery ? "No documents found" : "No documents yet"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
                    {searchQuery
                      ? "Try adjusting your search query or clear filters to see more results"
                      : "Get started by uploading your first document. Organize project files, share requirements, and collaborate with your team."}
                  </p>
                  {!searchQuery && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="pm-button-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
                          <Upload className="h-4 w-4" />
                          Upload Document
                        </button>
                      </DialogTrigger>
                      <UploadDocumentComponent />
                    </Dialog>
                  )}
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
      </div>
    </div>
  );
};

export default DocumentsPage;
