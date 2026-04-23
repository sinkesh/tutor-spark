import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Eye, EyeOff } from "lucide-react";
import { AgentDocument } from "@/types/documents";
import { cn } from "@/lib/utils";

interface DocumentPreviewButtonProps {
  agentId?: string;
  agentName?: string;
  documentCount?: number;
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  isSplitViewOpen?: boolean;
}

export default function DocumentPreviewButton({
  agentId,
  agentName,
  documentCount = 0,
  isLoading = false,
  disabled = false,
  onClick,
  isSplitViewOpen = false,
}: DocumentPreviewButtonProps) {
  return (
    <Button
      variant={isSplitViewOpen ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "gap-2 relative",
        isSplitViewOpen && "bg-primary text-primary-foreground"
      )}
      title={
        isSplitViewOpen 
          ? "Close document preview" 
          : !agentId 
            ? "Agent documents will be available when you start a chat" 
            : `View ${agentName} documents`
      }
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isSplitViewOpen ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
      
      <span>{isSplitViewOpen ? "Hide" : "Documents"}</span>
      
      {documentCount > 0 && !isSplitViewOpen && (
        <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
          {documentCount > 99 ? '99+' : documentCount}
        </Badge>
      )}
    </Button>
  );
}
