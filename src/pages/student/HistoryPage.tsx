import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History,
  Search,
  MessageSquare,
  Bot,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
  Archive,
  Filter,
  Bookmark,
} from "lucide-react";
import { getChatSessions, deleteChatSession, getRecentActivityStudent } from "@/config/services";
import { ChatSession } from "@/types/chat";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const res = await getRecentActivityStudent(user?.id);
      setRecentActivity(res);
    } catch (err) {
      console.log(err);
    }
  };

  const loadSessions = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await getChatSessions(user.id);
      console.log("Sessions loaded in history:", response);
      const sessionsData = response.sessions || response.chat_sessions || response;
      console.log("Sessions data extracted:", sessionsData);

      // Map your backend response to ChatSession format
      const formattedSessions = (sessionsData || []).map((session: any) => {
        console.log("History processing session:", session);

        // Extract subject from title or use a mapping
        let agentName = session.agent_name;
        if (!agentName && session.title) {
          // Extract subject from title like "New Science Chat" -> "Science"
          const subjectMatch = session.title.match(/New (\w+) Chat/);
          agentName = subjectMatch ? subjectMatch[1] : session.title.split(' ')[0];
        }

        const formattedSession = {
          id: session.chat_session_id || session.id,
          user_id: user.id,
          title: session.title,
          agent_type: session.agent_type || 'subject',
          agent_name: agentName || 'General',
          agent_id: session.agent_id,
          created_at: session.created_at || new Date().toISOString(),
          updated_at: session.updated_at || new Date().toISOString(),
          last_message_at: session.last_message_at || session.created_at || new Date().toISOString(),
          message_count: session.message_count || 0,
          is_archived: session.is_archived || false
        };

        console.log("History formatted session:", formattedSession);
        return formattedSession;
      });

      console.log("Formatted sessions:", formattedSessions);
      setSessions(formattedSessions);
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
      toast.error("Failed to load chat sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!user?.id) return;

    // Confirm deletion
    const confirmed = window.confirm("Are you sure you want to delete this chat session? This action cannot be undone.");
    if (!confirmed) return;

    try {
      console.log("Attempting to delete session:", sessionId, "for user:", user.id);
      await deleteChatSession(user.id, sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success("Chat session deleted");
    } catch (error: any) {
      console.error("Failed to delete session:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);

      // Handle specific error cases
      if (error.response?.status === 404) {
        toast.error("Session not found or already deleted");
        // Remove from UI anyway if it doesn't exist
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to delete this session");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        toast.error("Network error. Please check your connection.");
      } else {
        // Show more specific error message from backend if available
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to delete session";
        toast.error(errorMessage);
      }
    }
  };

  const handleArchiveSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    // Since archive is not available in API, we'll just delete for now
    await handleDeleteSession(sessionId, event);
    toast.success("Chat session archived");
  };

  const handleSessionClick = (session: ChatSession) => {
    navigate(`/student/chat/session/${session.id}`);
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredSessions = sessions
    .filter(session => !session.is_archived)
    .filter(session =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.agent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.preview_message && session.preview_message.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(session => typeFilter === "all" || session.agent_type === typeFilter)
    .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

  return (
    <StudentLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="hero-card mb-8">
          <div className="flex items-center gap-4 p-6 sm:p-7 learning-grid">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg gradient-accent shadow-lg shadow-accent/25">
              <History className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-2 border border-white/70 bg-white/70">
                Learning archive
              </Badge>
              <h1 className="text-2xl font-bold text-foreground sm:text-4xl">
                Learning Timeline
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Review recent chats here, and use Saved Chats for the bookmarked-style archive view.
              </p>
            </div>
            <Button
              variant="gradient-accent"
              className="ml-auto hidden sm:inline-flex"
              onClick={() => navigate("/student/conversation-history")}
            >
              <Bookmark className="h-4 w-4" />
              Saved Chats
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card variant="elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {recentActivity?.total_count || sessions.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Conversations
                </p>
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {recentActivity?.agents_used_count || '1'}
                </p>
                <p className="text-sm text-muted-foreground">
                  AI Teachers Used
                </p>
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-4 flex items-center gap-4 opacity-70 pointer-events-none">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">51</p>
                <p className="text-sm text-muted-foreground">Total Messages</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-white/70 bg-white/75 p-3 shadow-lg shadow-slate-200/60 backdrop-blur-xl dark:border-white/10 dark:bg-white/10 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-white/70 bg-white/80 pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full border-white/70 bg-white/80 sm:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="class">Class</SelectItem>
              <SelectItem value="subject">Subject</SelectItem>
              <SelectItem value="course">Course</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sessions List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg border border-white/70 bg-white/65 animate-pulse">
                  <div className="h-4 bg-muted-foreground/20 rounded mb-2" />
                  <div className="h-3 bg-muted-foreground/10 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="rounded-lg border border-white/70 bg-white/75 py-12 text-center shadow-lg shadow-slate-200/60">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-primary opacity-80" />
              <h3 className="font-medium mb-2">No conversations yet</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try adjusting your search" : "Start a new chat to see it here"}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className="group hover-lift relative cursor-pointer rounded-lg border border-white/70 bg-white/75 p-4 hover:border-primary/35 hover:bg-white"
                onClick={() => handleSessionClick(session)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/10">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{session.title}</h4>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {session.agent_type}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mb-1">
                      {session.agent_name}
                    </p>

                    {session.preview_message && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {session.preview_message}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {session.message_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatLastMessageTime(session.last_message_at)}
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveSession(session.id, e);
                        }}
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
