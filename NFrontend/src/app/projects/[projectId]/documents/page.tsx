"use client";
import { useParams } from "next/navigation";
import { FileText, Download, Trash2, Eye, MoreVertical, Search, Calendar, User, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import ProjectHeader from "@/components/projects/ProjectHeader";
import UploadDocumentButton from "@/components/projects/UploadDocumentButton";
import DocumentPreviewDialog from "@/components/projects/DocumentPreviewDialog";
import documentService, { Document } from "@/services/documentService";
import toast from "react-hot-toast";
import DeleteConfirmationDialog from "@/components/common/DeleteConfirmationDialog";

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "📄";
    case "doc":
    case "docx":
      return "📝";
    case "md":
    case "txt":
      return "📋";
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
      return "🖼️";
    case "xls":
    case "xlsx":
      return "📊";
    case "ppt":
    case "pptx":
      return "📊";
    default:
      return "📄";
  }
};

const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined || bytes === null) return "Unknown";
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

const ProjectDocumentsPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: number; name: string } | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [documentToPreview, setDocumentToPreview] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [projectId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentService.getDocuments(projectId);
      setDocuments(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch documents");
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (documentId: number, documentName: string) => {
    setDocumentToDelete({ id: documentId, name: documentName });
    setDeleteDialogOpen(true);
  };

  const handleViewClick = (document: Document) => {
    setDocumentToPreview(document);
    setPreviewDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      await documentService.deleteDocument(projectId, documentToDelete.id);
      toast.success("Document deleted successfully");
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete document");
    }
  };

  const categories = ["all", ...Array.from(new Set(documents.map(d => d.category).filter(Boolean)))];
  
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (doc.uploaded_by_email && doc.uploaded_by_email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader />
      <div className="px-6 py-8">
        {/* Upload Document Card and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Upload Document Card */}
          <UploadDocumentButton
            projectId={projectId}
            description="Add new files"
            onSuccess={fetchDocuments}
          />

          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">{documents.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Documents</p>
          </div>
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">
              {formatFileSize(documents.reduce((sum, d) => sum + (d.file_size || 0), 0))}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Size</p>
          </div>
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">
              {new Set(documents.map(d => d.category).filter(Boolean)).size}
            </p>
            <p className="text-xs text-gray-500 mt-1">Categories</p>
          </div>
          <div className="pm-card p-5">
            <p className="text-2xl font-semibold text-gray-900">
              {documents.filter(d => {
                const uploadDate = new Date(d.created_at);
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
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[160px] flex-shrink-0 transition-all"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading documents...</p>
            </div>
          </div>
        ) : error ? (
          <div className="pm-card p-16 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading documents</h3>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="pm-card p-5 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-3xl flex-shrink-0">{getFileIcon(doc.name)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate" title={doc.name}>
                        {doc.name}
                      </h3>
                      <p className="text-xs text-gray-500">{formatFileSize(doc.file_size)}</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                
                {doc.category && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200">
                      {doc.category}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {doc.uploaded_by_email || "Unknown"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {doc.file_url && (
                    <button
                      onClick={() => handleViewClick(doc)}
                      className="flex-1 pm-button-secondary text-xs py-2"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </button>
                  )}
                  {doc.file_url && (
                    <a
                      href={doc.file_url}
                      download
                      className="flex-1 pm-button-secondary text-xs py-2"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteClick(doc.id, doc.name)}
                    className="p-2 pm-button-secondary text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
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
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Document"
          description={`Are you sure you want to delete "{name}"? This action cannot be undone and the document will be permanently removed.`}
          itemName={documentToDelete?.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDocumentToDelete(null)}
        />

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

export default ProjectDocumentsPage;

