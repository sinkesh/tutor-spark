import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Search,
  Loader2,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  Download,
  Eye,
} from "lucide-react";
import { AgentDocument } from "@/types/documents";
import { cn } from "@/lib/utils";

interface DocumentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: AgentDocument[];
  isLoading: boolean;
  error: string | null;
  onDocumentSelect: (document: AgentDocument) => void;
  agentName?: string;
}

export default function DocumentListModal({
  isOpen,
  onClose,
  documents,
  isLoading,
  error,
  onDocumentSelect,
  agentName,
}: DocumentListModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const getFileIcon = (fileType?: string) => {
    const type = fileType?.toLowerCase() || '';
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes('image') || type.includes('jpg') || type.includes('png')) return <FileImage className="w-5 h-5 text-green-500" />;
    if (type.includes('video') || type.includes('mp4')) return <FileVideo className="w-5 h-5 text-purple-500" />;
    if (type.includes('audio') || type.includes('mp3')) return <FileAudio className="w-5 h-5 text-blue-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {agentName ? `${agentName} Documents` : 'Agent Documents'}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading documents...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-2">
                {searchQuery ? 'No documents found' : 'No documents available'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms' : 'This agent has no documents to display'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer group"
                  onClick={() => onDocumentSelect(document)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getFileIcon(document.file_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {document.title || document.name}
                        </h4>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDocumentSelect(document);
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {document.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {document.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {document.file_name && (
                          <span className="truncate">{document.file_name}</span>
                        )}
                        {document.file_size && (
                          <span>{formatFileSize(document.file_size)}</span>
                        )}
                        {document.pages && (
                          <span>{document.pages} pages</span>
                        )}
                        {document.upload_date && (
                          <span>{formatDate(document.upload_date)}</span>
                        )}
                      </div>
                      
                      {document.subject && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {document.subject}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
            </p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
