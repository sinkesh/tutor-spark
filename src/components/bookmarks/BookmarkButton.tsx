import { useState } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createBookmark } from "@/config/services";

interface BookmarkButtonProps {
  studentId: string;
  conversationId: string;
  sessionId?: string;
  subject: string;
  className?: string;
}

export default function BookmarkButton({
  studentId,
  conversationId,
  sessionId,
  subject,
  className,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookmark = async () => {
    if (isLoading || isBookmarked) return;

    try {
      setIsLoading(true);
      await createBookmark(studentId, {
        conversation_id: conversationId,
        session_id: sessionId || undefined,
        subject,
      });
      setIsBookmarked(true);
      toast.success("Saved to bookmarks");
    } catch (error: any) {
      console.error("Failed to create bookmark:", error);
      if (error.response?.status === 409) {
        setIsBookmarked(true);
        toast.info("Already bookmarked");
      } else {
        toast.error("Failed to save bookmark");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleBookmark();
      }}
      disabled={isLoading || isBookmarked}
      className={cn(
        "p-1.5 rounded-full transition-colors opacity-70 hover:opacity-100 hover:bg-muted",
        isBookmarked && "text-amber-500 opacity-100",
        isLoading && "animate-pulse",
        className
      )}
      title={isBookmarked ? "Bookmarked" : "Save to bookmarks"}
      aria-label={isBookmarked ? "Bookmarked" : "Save to bookmarks"}
    >
      <Bookmark
        className={cn("w-3.5 h-3.5", isBookmarked && "fill-current")}
      />
    </button>
  );
}
