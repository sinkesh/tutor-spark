import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Bookmark, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import BookmarkList from "@/components/bookmarks/BookmarkList";
import { getBookmarks } from "@/config/services";

interface BookmarkItem {
  bookmark_id: string;
  student_id: string;
  session_id: string;
  conversation_id: string;
  subject: string;
  query: string;
  response: string;
  personal_notes: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export default function ConversationHistoryPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await getBookmarks(user.id);
      console.log("Bookmarks loaded:", response);
      setBookmarks(response.bookmarks || []);
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
      setError("Failed to load bookmarks");
      toast.error("Failed to load bookmarks");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="font-medium mb-2">Error loading bookmarks</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadBookmarks}>Try Again</Button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        {/* Header */}
        <div className="border-b border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => navigate("/student/history")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-bold">Saved Chats</h1>
              </div>
              <span className="text-sm text-muted-foreground">
                ({bookmarks.length} saved)
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/student/chat")}
            >
              Back to Chat
            </Button>
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-hidden bg-muted/20">
          <div className="max-w-5xl mx-auto h-full">
            <BookmarkList
              studentId={user?.id || ""}
              bookmarks={bookmarks}
              onRefresh={loadBookmarks}
            />
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
