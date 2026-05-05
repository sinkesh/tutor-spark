import { useState } from "react";
import { Bookmark, Trash2, Edit3, Save, X, Bot, User, MessageSquare, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateBookmark, deleteBookmark } from "@/config/services";
import MarkdownMessage from "@/components/MarkdownMessage";

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

interface BookmarkListProps {
  studentId: string;
  bookmarks: BookmarkItem[];
  onRefresh: () => void;
}

export default function BookmarkList({ studentId, bookmarks, onRefresh }: BookmarkListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleDelete = async (bookmarkId: string) => {
    if (!confirm("Are you sure you want to delete this bookmark?")) return;

    try {
      setIsLoading((prev) => ({ ...prev, [bookmarkId]: true }));
      await deleteBookmark(studentId, bookmarkId);
      toast.success("Bookmark deleted");
      onRefresh();
    } catch (error) {
      console.error("Failed to delete bookmark:", error);
      toast.error("Failed to delete bookmark");
    } finally {
      setIsLoading((prev) => ({ ...prev, [bookmarkId]: false }));
    }
  };

  const startEdit = (bookmark: BookmarkItem) => {
    setEditingId(bookmark.bookmark_id);
    setEditNotes(bookmark.personal_notes || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNotes("");
  };

  const saveNotes = async (bookmarkId: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, [bookmarkId]: true }));
      await updateBookmark(studentId, bookmarkId, editNotes);
      toast.success("Notes updated");
      setEditingId(null);
      onRefresh();
    } catch (error) {
      console.error("Failed to update notes:", error);
      toast.error("Failed to update notes");
    } finally {
      setIsLoading((prev) => ({ ...prev, [bookmarkId]: false }));
    }
  };

  const toggleExpand = (bookmarkId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookmarkId)) {
        next.delete(bookmarkId);
      } else {
        next.add(bookmarkId);
      }
      return next;
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatResponse = (response: string): string => {
    try {
      const parsed = JSON.parse(response);
      if (typeof parsed === "object" && parsed !== null) {
        if (typeof parsed.full_plan === "string") return parsed.full_plan;
        if (typeof parsed.summary === "string" && !parsed.plan) return parsed.summary;
        if (Array.isArray(parsed.plan)) {
          const lines: string[] = [];
          if (parsed.topic_details?.title) {
            lines.push(`# ${parsed.topic_details.title}\n`);
          }
          parsed.plan.forEach((day: any) => {
            lines.push(`## ${day.focus || `Day ${day.day}`}\n`);
            if (Array.isArray(day.tasks)) {
              day.tasks.forEach((task: string) => lines.push(`- ${task}`));
            }
            if (day.duration_minutes) {
              lines.push(`\n*Duration: ${day.duration_minutes} minutes*`);
            }
            lines.push("");
          });
          if (parsed.subtopics?.length) {
            lines.push(`\n**Subtopics:** ${parsed.subtopics.join(", ")}`);
          }
          return lines.join("\n");
        }
        if (typeof parsed.response === "string") return parsed.response;
      }
    } catch {
      // Not valid JSON, return as-is
    }
    return response;
  };

  if (!bookmarks?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Bookmark className="w-12 h-12 text-muted-foreground opacity-40 mb-4" />
        <h3 className="font-medium text-lg mb-2">No saved bookmarks yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          While chatting, click the bookmark icon on any AI response to save it here for quick revision.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {bookmarks.map((bookmark) => (
          <Card
            key={bookmark.bookmark_id}
            className="overflow-hidden border border-white/70 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60"
          >
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/70 bg-white/60 dark:bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bookmark className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="text-xs">
                      {bookmark.subject}
                    </Badge>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDate(bookmark.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {editingId === bookmark.bookmark_id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600"
                        onClick={() => saveNotes(bookmark.bookmark_id)}
                        disabled={isLoading[bookmark.bookmark_id]}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={cancelEdit}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => startEdit(bookmark)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(bookmark.bookmark_id)}
                        disabled={isLoading[bookmark.bookmark_id]}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Query */}
              {bookmark.query && (
                <div className="px-5 py-3 border-b border-white/50">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-md bg-slate-950 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1 font-medium">Your Question</p>
                      <p className="text-sm text-foreground">{bookmark.query}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Response */}
              {bookmark.response && (
                <div className="px-5 py-3 border-b border-white/50">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1 font-medium">AI Response</p>
                      <div
                        className={cn(
                          "text-sm text-foreground prose prose-sm max-w-none overflow-hidden transition-all",
                          !expandedIds.has(bookmark.bookmark_id) && "max-h-32 line-clamp-5"
                        )}
                      >
                        <MarkdownMessage content={formatResponse(bookmark.response)} />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => toggleExpand(bookmark.bookmark_id)}
                      >
                        {expandedIds.has(bookmark.bookmark_id) ? (
                          <><ChevronUp className="w-3 h-3 mr-1" /> Show less</>
                        ) : (
                          <><ChevronDown className="w-3 h-3 mr-1" /> Show more</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Notes */}
              <div className="px-5 py-3 bg-yellow-50/40 dark:bg-yellow-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Your Notes</p>
                </div>
                {editingId === bookmark.bookmark_id ? (
                  <textarea
                    className="w-full text-sm bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add your personal notes..."
                  />
                ) : (
                  <p className={cn(
                    "text-sm",
                    bookmark.personal_notes ? "text-foreground" : "text-muted-foreground italic"
                  )}>
                    {bookmark.personal_notes || "No notes added yet."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
