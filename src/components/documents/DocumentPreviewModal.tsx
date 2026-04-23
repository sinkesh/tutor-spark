import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import {
  Loader2,
} from "lucide-react";

import { toast } from "sonner";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
  isLoading: boolean;
  error: string | null;
}

export default function DocumentPreviewModal({
  isOpen,
  onClose,
  document,
  isLoading,
  error,
}: DocumentPreviewModalProps) {

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const downloadUrl = document?.metadata?.download_url;

  // Fetch authenticated PDF
  useEffect(() => {
    if (!document || document?.content_type !== "pdf") return;

    const loadPdf = async () => {
      try {
        setPdfLoading(true);

        const token = localStorage.getItem("access_token");

        const response = await fetch(downloadUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch PDF");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        setPdfUrl(url);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load PDF preview");
      } finally {
        setPdfLoading(false);
      }
    };

    loadPdf();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };

  }, [document]);

  const renderPreview = () => {

    if (pdfLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="animate-spin w-6 h-6" />
        </div>
      );
    }

    if (!pdfUrl) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Preview unavailable
        </div>
      );
    }

    return (
      <iframe
        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbars=0`}
        title="PDF Preview"
        className="w-full h-full bg-white"
      />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-6xl h-[85vh] p-0 overflow-hidden"
      >
        <div className="w-full h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin w-6 h-6" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-destructive">
              {error}
            </div>
          ) : (
            renderPreview()
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}