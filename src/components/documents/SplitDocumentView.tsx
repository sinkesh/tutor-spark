import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Share2,
  Eye,
  Printer,
  Maximize2,
  Minimize2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentDocument, DocumentPreview } from "@/types/documents";
import MarkdownMessage from "@/components/MarkdownMessage";
import TextSelectionPopup from "@/components/documents/TextSelectionPopup";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface SplitDocumentViewProps {
  document: DocumentPreview | null;
  documents: AgentDocument[];
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onDocumentSelect: (document: AgentDocument) => void;
  onPreviousDocument?: () => void;
  onNextDocument?: () => void;
  hasNextDocument?: boolean;
  hasPreviousDocument?: boolean;
  currentDocumentIndex?: number;
  onTextAction?: (action: 'explain' | 'summarize', text: string, documentId: string) => void;
}

export default function SplitDocumentView({
  document,
  documents,
  isLoading,
  error,
  onClose,
  onDocumentSelect,
  onPreviousDocument,
  onNextDocument,
  hasNextDocument = false,
  hasPreviousDocument = false,
  currentDocumentIndex = 0,
  onTextAction,
}: SplitDocumentViewProps) {
  const [zoom, setZoom] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [selectedText, setSelectedText] = useState<string>("");
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const handleExplain = (text: string) => {
    console.log('SplitDocumentView handleExplain called with:', text);
    if (onTextAction && document) {
      console.log('Calling onTextAction with explain');
      onTextAction('explain', text, document.id);
    }
    setShowPopup(false);
  };

  const handleSummarize = (text: string) => {
    console.log('SplitDocumentView handleSummarize called with:', text);
    if (onTextAction && document) {
      console.log('Calling onTextAction with summarize');
      onTextAction('summarize', text, document.id);
    }
    setShowPopup(false);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setSelectedText('');
  };

  useEffect(() => {
    const handleTextSelectionGlobal = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      
      console.log('Text selection detected:', selectedText);
      
      if (selectedText && selectedText.length > 3) {
        const range = selection?.getRangeAt(0);
        if (range) {
          const rect = range.getBoundingClientRect();
          console.log('Selection rect:', rect);
          setSelectedText(selectedText);
          setPopupPosition({
            x: rect.left + window.scrollX,
            y: rect.bottom + window.scrollY + 5
          });
          setShowPopup(true);
          console.log('Popup should show with text:', selectedText);
        }
      } else {
        setShowPopup(false);
      }
    };

    window.document.addEventListener('mouseup', handleTextSelectionGlobal);
    window.document.addEventListener('selectionchange', handleTextSelectionGlobal);
    
    return () => {
      window.document.removeEventListener('mouseup', handleTextSelectionGlobal);
      window.document.removeEventListener('selectionchange', handleTextSelectionGlobal);
    };
  }, [document]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleNextPage = () => {
    if (document && currentPage < (document.total_pages || 1)) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleShare = () => {
    if (document && navigator.share) {
      navigator.share({
        title: document.metadata?.title || 'Document',
        text: `Check out this document: ${document.metadata?.title || 'Untitled'}`,
        url: window.location.href
      });
    }
  };

  const handlePrint = () => {
    if (document) {
      window.print();
    }
  };

  const loadAuthenticatedPdf = async () => {
    if (!document?.metadata?.download_url) {
      setPdfError('No PDF URL available');
      return;
    }

    setIsPdfLoading(true);
    setPdfError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(document.metadata.download_url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view this document.');
        } else if (response.status === 404) {
          throw new Error('Document not found.');
        } else {
          throw new Error(`Failed to load PDF: ${response.status} ${response.statusText}`);
        }
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setPdfBlobUrl(blobUrl);

      // Clean up blob URL when component unmounts
      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    } catch (error) {
      console.error('Failed to load authenticated PDF:', error);
      setPdfError(error instanceof Error ? error.message : 'Failed to load PDF');
    } finally {
      setIsPdfLoading(false);
    }
  };

  // Load PDF when document changes
  useEffect(() => {
    if (document?.content_type === 'pdf' && document.metadata?.download_url) {
      loadAuthenticatedPdf();
    }

    // Cleanup previous blob URL
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
    };
  }, [document?.id, document?.metadata?.download_url]);

  const handleOpenInNewTab = () => {
    if (pdfBlobUrl) {
      window.open(pdfBlobUrl, '_blank', 'noopener,noreferrer');
    } else if (document?.metadata?.download_url) {
      // Fallback to original URL (may fail authentication)
      window.open(document.metadata.download_url, '_blank', 'noopener,noreferrer');
    }
  };

  const getAuthenticatedPdfUrl = () => {
    if (pdfBlobUrl) {
      return pdfBlobUrl;
    }
    return '';
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (error) {
    return (
      <div className="w-1/2 h-full bg-background border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Document Preview</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Failed to load document</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-1/2 h-full bg-background border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Document Preview</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="w-1/2 h-full bg-background border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold">Select a Document</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Choose a document to view alongside your chat
          </p>
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && documents.length > 0 && (
            <div className="mt-2 p-2 bg-muted rounded text-xs">
              <p>Debug: Found {documents.length} documents</p>
              {documents[0] && (
                <p>Agent ID: {documents[0].agent_id}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Document List */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No documents available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start a chat to see documents for this subject
                  </p>
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 p-2 bg-muted rounded text-xs">
                      <p>Debug: Check console for agent ID resolution</p>
                    </div>
                  )}
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md group"
                    onClick={() => onDocumentSelect(doc)}
                    data-document-id={doc.id}
                    data-document-name={doc.name || doc.title}
                    data-document-file-name={doc.file_name}
                    data-document-agent-id={doc.agent_id}
                    data-document-agent-name={doc.agent_name}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate mb-1">{doc.title || doc.name}</h4>
                        <p className="text-xs text-muted-foreground truncate mb-2">{doc.file_name}</p>
                        <div className="flex items-center gap-2">
                          {doc.agent_name && (
                            <Badge variant="secondary" className="text-xs">
                              {doc.agent_name}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Click to open →
                          </span>
                          {/* Debug info */}
                          {process.env.NODE_ENV === 'development' && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ID: {doc.agent_id?.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-1/2 h-full bg-background border-r border-border flex flex-col overflow-hidden", // Added overflow-hidden
      isFullscreen && "fixed inset-0 w-full z-50"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm truncate max-w-[200px]">
                  {document.metadata?.title || document.metadata?.file_name || 'Document'}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onPreviousDocument} disabled={!hasPreviousDocument}>
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              {currentDocumentIndex + 1} / {documents.length}
            </span>
            <Button variant="outline" size="sm" onClick={onNextDocument} disabled={!hasNextDocument}>
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
        </div>

        {/* Toolbar */}
        
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-gray-900 min-h-0"> {/* Added min-h-0 */}
        <ScrollArea className="h-full">
          <div className="h-full min-h-full"> {/* Added min-h-full */}
            {document.content_type === 'pdf' ? (
              <div className="h-full" ref={pdfContainerRef}>
                {isPdfLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading PDF...</p>
                    </div>
                  </div>
                ) : pdfError ? (
                  <div className="flex flex-col items-center justify-center h-full p-8">
                    <FileText className="w-24 h-24 mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2">Authentication Error</h3>
                    <p className="text-muted-foreground">{pdfError}</p>
                  </div>
                ) : pdfBlobUrl ? (
                  <div className="h-full overflow-auto">
                    <Document
                      file={pdfBlobUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading PDF...</p>
                          </div>
                        </div>
                      }
                      error={
                        <div className="flex flex-col items-center justify-center h-full p-8">
                          <FileText className="w-24 h-24 mb-4 text-muted-foreground/50" />
                          <h3 className="text-lg font-semibold mb-2">PDF Load Error</h3>
                          <p className="text-muted-foreground">Failed to load PDF document</p>
                        </div>
                      }
                    >
                      {Array.from(new Array(numPages), (el, index) => (
                        <div key={`page_${index + 1}`} className="mb-4">
                          <Page
                            pageNumber={index + 1}
                            scale={zoom / 100}
                            className="shadow-lg"
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                          />
                        </div>
                      ))}
                    </Document>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No PDF available</p>
                  </div>
                )}
              </div>
            ) : document.content_type === 'markdown' ? (
              <div className="prose prose-sm max-w-none dark:prose-invert p-8 min-h-full">
                <MarkdownMessage content={document.content} />
              </div>
            ) : document.content_type === 'html' ? (
              <div 
                className="prose prose-sm max-w-none dark:prose-invert p-8 min-h-full"
                dangerouslySetInnerHTML={{ __html: document.content }}
              />
            ) : (
              <div className="whitespace-pre-wrap text-sm font-mono bg-gray-50 dark:bg-gray-800 p-8 rounded-lg min-h-[600px] min-h-full">
                <div className="mb-4 pb-4 border-b border-border">
                  <h2 className="text-lg font-bold">
                    {document.metadata?.title || document.metadata?.file_name || 'Text Document'}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {document.metadata?.created_at && (
                      <span>Created: {new Date(document.metadata.created_at).toLocaleDateString()}</span>
                    )}
                    <span>Type: {document.content_type}</span>
                  </div>
                </div>
                {document.content}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Text Selection Popup */}
      <TextSelectionPopup
        selectedText={selectedText}
        position={popupPosition}
        onExplain={handleExplain}
        onSummarize={handleSummarize}
        onClose={handlePopupClose}
        isVisible={showPopup}
      />
    </div>
  );
}
