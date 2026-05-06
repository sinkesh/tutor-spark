import { useState, useEffect } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentAgent, getDocumentsByAgent } from "@/config/services";
import DocumentPreviewModal from "@/components/documents/DocumentPreviewModal";
import { BASE_URL, VERSION } from "@/config/api_urls";
import {
  FileText,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  Search,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface AgentDocument {
  id: string;
  name: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  upload_date?: string;
  subject?: string;
  class_name?: string;
  agent_id: string;
  agent_name?: string;
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [documents, setDocuments] = useState<AgentDocument[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Fetch student subjects on mount
  useEffect(() => {
    if (!user?.id) return;

    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        const res = await getStudentAgent(user.id);
        const subs = res?.student_subjects || [];
        setSubjects(subs);
        if (subs.length > 0 && subs[0].subject_agent_id) {
          setSelectedSubjectId(subs[0].subject_agent_id);
        }
      } catch (err) {
        toast.error("Failed to load subjects");
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [user?.id]);

  // Fetch documents when selected subject changes
  useEffect(() => {
    if (!selectedSubjectId) return;

    const fetchDocs = async () => {
      setIsLoadingDocs(true);
      try {
        const res = await getDocumentsByAgent(selectedSubjectId);
        if (res.status === "success") {
          const mapped: AgentDocument[] = (res.documents || []).map(
            (doc: any) => ({
              id: doc.filename || doc.safe_filename || String(Math.random()),
              name: doc.filename || "Untitled",
              title: doc.filename || "Untitled",
              file_name: doc.filename || "",
              file_type: doc.content_type || "application/octet-stream",
              file_size: doc.size || 0,
              upload_date: doc.uploaded_at,
              subject: res.subject,
              class_name: res.class,
              agent_id: res.subject_agent_id,
              agent_name: res.subject,
            })
          );
          setDocuments(mapped);
        } else {
          setDocuments([]);
        }
      } catch (err) {
        toast.error("Failed to load documents");
        setDocuments([]);
      } finally {
        setIsLoadingDocs(false);
      }
    };

    fetchDocs();
  }, [selectedSubjectId]);

  const filteredDocs = documents.filter((doc) =>
    (doc.name || doc.title || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleDocumentClick = (doc: AgentDocument) => {
    const encodedId = encodeURIComponent(doc.id);
    const downloadUrl = `${BASE_URL}${VERSION}/student/documents/${user?.id}/agents/${doc.agent_id}/documents/${encodedId}/preview`;

    setSelectedDocument({
      metadata: {
        title: doc.title,
        file_name: doc.file_name,
        download_url: downloadUrl,
      },
      content_type: "pdf",
    });
    setIsPreviewOpen(true);
    setPreviewLoading(true);
    // Modal handles the actual fetch; brief delay for UX
    setTimeout(() => setPreviewLoading(false), 600);
  };

  const getFileIcon = (fileType?: string) => {
    const type = (fileType || "").toLowerCase();
    if (type.includes("pdf"))
      return <FileText className="w-5 h-5 text-red-500" />;
    if (
      type.includes("image") ||
      type.includes("jpg") ||
      type.includes("png")
    )
      return <FileImage className="w-5 h-5 text-green-500" />;
    if (type.includes("video") || type.includes("mp4"))
      return <FileVideo className="w-5 h-5 text-purple-500" />;
    if (type.includes("audio") || type.includes("mp3"))
      return <FileAudio className="w-5 h-5 text-blue-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString();
  };

  const selectedSubjectName =
    subjects.find((s) => s.subject_agent_id === selectedSubjectId)?.name ||
    "Documents";

  return (
    <StudentLayout>
      <div className="dashboard-page-padding">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Browse and preview documents for your subjects
          </p>
        </div>

        {/* Subject selector */}
        <div className="mb-6">
          <Select
            value={selectedSubjectId}
            onValueChange={setSelectedSubjectId}
            disabled={isLoadingSubjects || subjects.length === 0}
          >
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((sub) => (
                <SelectItem
                  key={sub.subject_agent_id}
                  value={sub.subject_agent_id}
                >
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Document list */}
        <Card className="insight-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedSubjectName}</span>
              {!isLoadingDocs && (
                <span className="text-sm font-normal text-muted-foreground">
                  {filteredDocs.length} document
                  {filteredDocs.length !== 1 ? "s" : ""}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDocs ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">
                  {searchQuery ? "No matching documents" : "No documents available"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "This subject has no documents yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer group"
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getFileIcon(doc.file_type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm truncate">
                            {doc.title || doc.name}
                          </h4>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDocumentClick(doc);
                              }}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                          {doc.file_name && (
                            <span className="truncate">{doc.file_name}</span>
                          )}
                          {doc.file_size > 0 && (
                            <span>{formatFileSize(doc.file_size)}</span>
                          )}
                          {doc.upload_date && (
                            <span>{formatDate(doc.upload_date)}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          {doc.subject && (
                            <Badge variant="secondary" className="text-xs">
                              {doc.subject}
                            </Badge>
                          )}
                          {doc.class_name && (
                            <Badge variant="outline" className="text-xs">
                              {doc.class_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
        isLoading={previewLoading}
        error={null}
      />
    </StudentLayout>
  );
}
