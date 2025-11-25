"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Upload, FileText, Search, Filter, Download, MoreVertical, Calendar, User, Clock, FolderOpen } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import PageHeader from "@/components/common/PageHeader";
import UploadDocumentComponent from "@/components/projects/UploadDocumentComponent";

// Mock documents
const mockDocuments = [
  { id: 1, name: "Project Requirements.pdf", project: "E-Commerce Platform", uploadedBy: "John Doe", uploadedAt: "2024-02-10", size: "2.4 MB", type: "pdf" },
  { id: 2, name: "Technical Specification.docx", project: "Mobile Banking App", uploadedBy: "Jane Smith", uploadedAt: "2024-02-08", size: "1.8 MB", type: "doc" },
  { id: 3, name: "Design Mockups.fig", project: "AI Analytics Dashboard", uploadedBy: "Mike Johnson", uploadedAt: "2024-02-05", size: "5.2 MB", type: "fig" },
  { id: 4, name: "API Documentation.md", project: "E-Commerce Platform", uploadedBy: "Sarah Wilson", uploadedAt: "2024-02-03", size: "0.5 MB", type: "md" },
  { id: 5, name: "Database Schema.sql", project: "Mobile Banking App", uploadedBy: "Alex Brown", uploadedAt: "2024-02-01", size: "0.3 MB", type: "sql" },
  { id: 6, name: "User Stories.xlsx", project: "AI Analytics Dashboard", uploadedBy: "Chris Lee", uploadedAt: "2024-01-28", size: "0.9 MB", type: "xlsx" },
];

const DocumentsPage = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProject, setFilterProject] = useState("all");

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = filterProject === "all" || doc.project === filterProject;
    
    // Apply tab filters
    let matchesTab = true;
    if (tab === "recent") {
      // Show documents uploaded in last 7 days
      const uploadDate = new Date(doc.uploadedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesTab = uploadDate > weekAgo;
    } else if (tab === "by-project") {
      // Group by project - show all but will be grouped
      matchesTab = true;
    }
    
    return matchesSearch && matchesProject && matchesTab;
  });

  const getFileIcon = (type: string) => {
    return <FileText className="h-5 w-5 text-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Documents"
        description="Manage project documents and files across all your projects"
        icon={FileText}
        tabs={[
          { icon: FileText, label: "Documents", href: "/documents" },
          { icon: Clock, label: "Recent", href: "/documents?tab=recent" },
          { icon: FolderOpen, label: "By Project", href: "/documents?tab=by-project" },
        ]}
      />

      <div className="px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
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
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="pm-input min-w-[140px] flex-shrink-0"
              >
                <option value="all">All Projects</option>
                <option value="E-Commerce Platform">E-Commerce Platform</option>
                <option value="Mobile Banking App">Mobile Banking App</option>
                <option value="AI Analytics Dashboard">AI Analytics Dashboard</option>
              </select>
              <button className="pm-button-secondary whitespace-nowrap flex-shrink-0 inline-flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </button>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button className="pm-button-primary inline-flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </button>
              </DialogTrigger>
              <UploadDocumentComponent />
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button className="pm-card p-5 text-left group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <Upload className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Upload Document</h3>
                    <p className="text-xs text-gray-500">New document</p>
                  </div>
                </div>
              </button>

              <button className="pm-card p-5 text-left group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <Filter className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Filter Documents</h3>
                    <p className="text-xs text-gray-500">Advanced filters</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Documents Overview */}
            <div className="pm-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents Overview</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Total Documents</span>
                    <span className="font-medium text-gray-900">{mockDocuments.length}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full transition-all"
                      style={{ width: `${(mockDocuments.length / 20) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{mockDocuments.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Documents</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{new Set(mockDocuments.map(d => d.project)).size}</p>
                    <p className="text-xs text-gray-500 mt-1">Projects</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{new Set(mockDocuments.map(d => d.type)).size}</p>
                    <p className="text-xs text-gray-500 mt-1">File Types</p>
                  </div>
                </div>
              </div>
            </div>

            {/* All Documents Tab */}
            {tab === "all" && (
              <div className="pm-card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
                {filteredDocuments.length > 0 ? (
                <div className="space-y-3">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {getFileIcon(doc.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{doc.name}</h3>
                            <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200 uppercase">
                              {doc.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <Link href={`/projects`} className="hover:text-gray-900 cursor-pointer">{doc.project}</Link>
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {doc.uploadedBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {doc.uploadedAt}
                            </span>
                            <span>{doc.size}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Download">
                            <Download className="h-4 w-4 text-gray-600" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {searchQuery ? "Try adjusting your search" : "Upload your first document to get started"}
                  </p>
                  {!searchQuery && (
                    <button className="pm-button-primary inline-flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Document
                    </button>
                  )}
                </div>
              )}
              </div>
            )}

            {/* Recent Tab */}
            {tab === "recent" && (
              <div className="pm-card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Documents
                </h2>
                {filteredDocuments.length > 0 ? (
                  <div className="space-y-3">
                    {filteredDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            {getFileIcon(doc.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                              {doc.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{doc.project}</span>
                              <span>•</span>
                              <span>{doc.size}</span>
                              <span>•</span>
                              <span>{doc.uploadedAt}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Download className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No recent documents found
                  </div>
                )}
              </div>
            )}

            {/* By Project Tab */}
            {tab === "by-project" && (
              <div className="pm-card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Documents by Project
                </h2>
                <div className="space-y-6">
                  {Array.from(new Set(mockDocuments.map(d => d.project))).map((project) => {
                    const projectDocs = mockDocuments.filter(d => d.project === project);
                    return (
                      <div key={project} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">{project}</h3>
                        <div className="space-y-2">
                          {projectDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  {getFileIcon(doc.type)}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                                  <p className="text-xs text-gray-500">{doc.size} • {doc.uploadedAt}</p>
                                </div>
                              </div>
                              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <Download className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Documents Details */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Documents Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Total Documents</p>
                  <p className="text-sm font-medium text-gray-900">{mockDocuments.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Projects</p>
                  <p className="text-sm font-medium text-gray-900">{new Set(mockDocuments.map(d => d.project)).size}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">File Types</p>
                  <p className="text-sm font-medium text-gray-900">{new Set(mockDocuments.map(d => d.type)).size}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="pm-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-3 w-3 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900">
                        Document uploaded
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{i} hour{i > 1 ? 's' : ''} ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;

