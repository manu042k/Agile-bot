"use client";
import { useParams } from "next/navigation";
import { Upload, FileText, Download, Trash2, Eye, MoreVertical, Search, Filter, Calendar, User } from "lucide-react";
import { useState } from "react";
import ProjectHeader from "@/components/projects/ProjectHeader";

// Mock documents data
const getMockDocuments = (projectId: string) => [
  { id: 1, name: "Requirements_Specification.pdf", type: "pdf", size: "2.4 MB", uploadedBy: "John Doe", uploadedAt: "2024-01-20", category: "Requirements" },
  { id: 2, name: "System_Architecture.docx", type: "docx", size: "1.8 MB", uploadedBy: "Jane Smith", uploadedAt: "2024-01-22", category: "Design" },
  { id: 3, name: "API_Documentation.md", type: "md", size: "456 KB", uploadedBy: "Mike Johnson", uploadedAt: "2024-02-01", category: "Documentation" },
  { id: 4, name: "Database_Schema.png", type: "image", size: "892 KB", uploadedBy: "Sarah Wilson", uploadedAt: "2024-02-05", category: "Design" },
  { id: 5, name: "User_Stories.xlsx", type: "xlsx", size: "1.2 MB", uploadedBy: "Alex Brown", uploadedAt: "2024-02-08", category: "Requirements" },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return "📄";
    case "docx":
      return "📝";
    case "md":
      return "📋";
    case "image":
      return "🖼️";
    case "xlsx":
      return "📊";
    default:
      return "📄";
  }
};

const ProjectDocumentsPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  
  const mockDocuments = getMockDocuments(projectId);
  const categories = ["all", ...Array.from(new Set(mockDocuments.map(d => d.category)))];
  
  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader />
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Documents</h1>
              <p className="text-gray-600">Manage project documents and files</p>
            </div>
            <button className="pm-button-primary">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">{mockDocuments.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Documents</p>
          </div>
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">
              {mockDocuments.reduce((sum, d) => {
                const size = parseFloat(d.size);
                return sum + (d.size.includes("MB") ? size : size / 1000);
              }, 0).toFixed(1)} MB
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Size</p>
          </div>
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">
              {new Set(mockDocuments.map(d => d.category)).size}
            </p>
            <p className="text-xs text-gray-500 mt-1">Categories</p>
          </div>
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">
              {mockDocuments.filter(d => {
                const uploadDate = new Date(d.uploadedAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return uploadDate > weekAgo;
              }).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Uploaded This Week</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pm-input !pl-10 pr-3 w-full"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pm-input min-w-[160px] flex-shrink-0"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
          <button className="pm-button-secondary whitespace-nowrap flex-shrink-0">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="pm-card p-5 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-3xl flex-shrink-0">{getFileIcon(doc.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate" title={doc.name}>
                        {doc.name}
                      </h3>
                      <p className="text-xs text-gray-500">{doc.size}</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200">
                    {doc.category}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {doc.uploadedBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {doc.uploadedAt}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 pm-button-secondary text-xs py-2">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </button>
                  <button className="flex-1 pm-button-secondary text-xs py-2">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </button>
                  <button className="p-2 pm-button-secondary text-xs">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="pm-card p-16 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
              <p className="text-sm text-gray-500 mb-6">
                {searchQuery || filterCategory !== "all"
                  ? "Try adjusting your filters"
                  : "Upload your first document to get started"}
              </p>
              {!searchQuery && filterCategory === "all" && (
                <button className="pm-button-primary">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDocumentsPage;

