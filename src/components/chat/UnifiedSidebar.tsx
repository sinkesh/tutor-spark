import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getChatSessions, deleteChatSession, updateChatSession, getStudentAgent } from "@/config/services";
import { ChatSession } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Plus,
  Search,
  BookOpen,
  Trash2,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface UnifiedSidebarProps {
  currentSessionId?: string;
  onSessionSelect: (session: ChatSession) => void;
  onNewChat: () => void;
  onRenameSession?: (sessionId: string, currentTitle: string) => void;
  activeView: 'sessions' | 'subjects';
  collapsed?: boolean;
  refreshKey?: number; // Trigger to reload sessions
}

interface StudentSubject {
  subject_agent_id: string;
  name: string;
  description?: string;
}

export default function UnifiedSidebar({
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onRenameSession,
  activeView,
  collapsed = false,
  refreshKey = 0,
}: UnifiedSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    // Load sessions when viewing sessions tab, subjects when viewing subjects tab
    if (activeView === 'sessions') {
      loadSessions();
    } else if (activeView === 'subjects') {
      loadSubjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, refreshKey]);

  const loadSessions = async () => {
    if (!user?.id) return;

    try {
      setIsLoadingSessions(true);
      const response = await getChatSessions(user.id);
      // Handle API response format: { status, student_id, sessions: [...] }
      const sessionsData = response.sessions || [];

      const formattedSessions = sessionsData.map((session: any) => {
        // Use session_id from new API format
        const sessionId = session.session_id || session.id || session._id;

        return {
          id: sessionId,
          user_id: user.id,
          // Show only session_name as requested
          title: session.session_name || 'Untitled Chat',
          agent_type: session.agent_type || 'subject',
          agent_name: session.subject || 'General',
          agent_id: session.agent_id,
          created_at: session.created_at || new Date().toISOString(),
          updated_at: session.last_message_at || session.created_at || new Date().toISOString(),
          last_message_at: session.last_message_at || session.created_at || new Date().toISOString(),
          message_count: session.message_count || 0,
          is_archived: !session.is_active
        };
      }).filter((s: ChatSession) => s.id); // Filter out sessions without IDs

      console.log('UnifiedSidebar: Loaded sessions:', formattedSessions.length);
      setSessions(formattedSessions);
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
      toast.error("Failed to load chat sessions");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadSubjects = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingSubjects(true);
      const response = await getStudentAgent(user.id);
      setSubjects(response?.student_subjects || []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!user?.id) return;

    try {
      await deleteChatSession(user.id, sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success("Chat session deleted");
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete session");
    }
  };

  const handleUpdateSessionName = async (sessionId: string, newName: string) => {
    if (!user?.id || !newName.trim()) return;

    try {
      await updateChatSession(user.id, sessionId, { title: newName.trim() });
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, title: newName.trim() } : s
      ));
      toast.success("Session name updated");
    } catch (error) {
      console.error("Failed to update session name:", error);
      toast.error("Failed to update session name");
    }
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

  // Get current subject from URL or current session
  const getCurrentSubject = () => {
    const currentPath = window.location.pathname;
    console.log('Current path for subject detection:', currentPath);
    
    // First try to get subject from URL
    if (currentPath.toLowerCase().includes('/math')) return 'Math';
    if (currentPath.toLowerCase().includes('/science')) return 'Science';
    if (currentPath.toLowerCase().includes('/physics')) return 'Physics';
    if (currentPath.toLowerCase().includes('/chemistry')) return 'Chemistry';
    if (currentPath.toLowerCase().includes('/biology')) return 'Biology';
    if (currentPath.toLowerCase().includes('/english')) return 'English';
    if (currentPath.toLowerCase().includes('/history')) return 'History';
    if (currentPath.toLowerCase().includes('/geography')) return 'Geography';
    
    // If no subject in URL, try to get it from the current session
    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (currentSession?.agent_name) {
      console.log('Getting subject from current session:', currentSession.agent_name);
      return currentSession.agent_name;
    }
    
    return null;
  };

  const currentSubject = getCurrentSubject();
  console.log('Detected current subject:', currentSubject);

  const filteredSessions = sessions
    .filter(session => !session.is_archived)
    .filter(session => {
      const titleMatch = session.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const agentNameMatch = session.agent_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const previewMatch = session.preview_message?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      return titleMatch || agentNameMatch || previewMatch;
    })
    .filter(session => {
      // If we're in a specific subject context, only show sessions for that subject
      if (currentSubject) {
        console.log('Filtering session:', session.agent_name, 'for current subject:', currentSubject);
        return session.agent_name === currentSubject;
      }
      return true; // Show all sessions if not in a specific subject context
    })
    .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

  const filteredSubjects = subjects.filter(subject => {
    const nameMatch = subject.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const descMatch = subject.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    return nameMatch || descMatch;
  });

  if (collapsed) {
    return (
      <div className="p-2 space-y-2">
        <Button
          variant="gradient-accent"
          size="icon"
          onClick={onNewChat}
          className="w-full rounded-[20px]"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
        </Button>
        
        {activeView === 'sessions' && (
          <div className="space-y-1">
            {filteredSessions.slice(0, 5).map((session) => (
              <Button
                key={session.id}
                variant={currentSessionId === session.id ? "default" : "ghost"}
                size="icon"
                onClick={() => onSessionSelect(session)}
                className={cn(
                  "w-full rounded-[18px]",
                  currentSessionId === session.id && "bg-primary text-primary-foreground"
                )}
                title={session.title}
              >
                <Bot className="w-4 h-4" />
              </Button>
            ))}
          </div>
        )}
        
        {activeView === 'subjects' && (
          <div className="space-y-1">
            {filteredSubjects
              .filter(subject => currentSubject ? subject.name === currentSubject : true)
              .slice(0, 5).map((subject) => (
              <Link
                key={subject.subject_agent_id}
                to={`/student/chat/new/subject/${subject.name}`}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full rounded-[18px]"
                  title={subject.name}
                >
                  <BookOpen className="w-4 h-4" />
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Search */}
      <div className="border-b border-white/10 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={activeView === 'sessions' ? "Search conversations..." : "Search subjects..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-[20px] border-white/10 bg-slate-900/35 pl-10 text-white shadow-none placeholder:text-white/35 focus-visible:ring-white/20 dark:bg-slate-900/35"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeView === 'sessions' ? (
          /* Sessions View */
          <>
            {isLoadingSessions ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-[22px] bg-white/8 p-3 animate-pulse">
                    <div className="h-4 bg-muted-foreground/20 rounded mb-2" />
                    <div className="h-3 bg-muted-foreground/10 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">No conversations yet</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try adjusting your search" : "Start a new chat to see it here"}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "group relative rounded-[20px] border p-3 transition-all",
                      editingSessionId === session.id
                        ? "border-fuchsia-300 bg-white/10"
                        : "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
                      currentSessionId === session.id && editingSessionId !== session.id
                        ? "border-white/15 bg-white text-slate-950 shadow-lg shadow-slate-950/20"
                        : editingSessionId !== session.id && "border-transparent bg-white/8 text-white hover:border-white/10 hover:bg-white/12"
                    )}
                    onClick={() => {
                      if (editingSessionId) return;
                      console.log('Sidebar: Clicking session:', session);
                      if (!session.id) {
                        console.error('Sidebar: Session has no ID!');
                        return;
                      }
                      onSessionSelect(session);
                    }}
                  >
                    {editingSessionId === session.id ? (
                      /* Edit Mode */
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[16px] ring-1",
                          "bg-white/10 text-cyan-100 ring-white/10"
                        )}>
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateSessionName(session.id, editName);
                              setEditingSessionId(null);
                            } else if (e.key === 'Escape') {
                              setEditingSessionId(null);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 min-w-0 bg-transparent text-white text-sm font-medium border-b border-fuchsia-400 focus:outline-none focus:border-fuchsia-300 px-1 py-0.5"
                          autoFocus
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateSessionName(session.id, editName);
                            setEditingSessionId(null);
                          }}
                          className="p-1.5 rounded-full hover:bg-white/10 text-fuchsia-400"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSessionId(null);
                          }}
                          className="p-1.5 rounded-full hover:bg-white/10 text-white/50"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      /* Normal Mode */
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[16px] ring-1",
                          currentSessionId === session.id
                            ? "bg-slate-100 text-fuchsia-500 ring-slate-200"
                            : "bg-white/10 text-cyan-100 ring-white/10"
                        )}>
                          <MessageSquare className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "font-medium text-sm truncate",
                            currentSessionId === session.id ? "text-slate-950" : "text-white"
                          )}>
                            {session.title}
                          </h4>
                        </div>

                        {/* Three-dot menu - visible on hover */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className={cn(
                                "opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-white/10",
                                currentSessionId === session.id ? "text-slate-400 hover:text-slate-600" : "text-white/50 hover:text-white"
                              )}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingSessionId(session.id);
                                setEditName(session.title);
                              }}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteSession(session.id, e as unknown as React.MouseEvent)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Subjects View */
          <>
            {isLoadingSubjects ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-[22px] bg-white/8 p-3 animate-pulse">
                    <div className="h-4 bg-muted-foreground/20 rounded mb-2" />
                    <div className="h-3 bg-muted-foreground/10 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">No subjects available</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try adjusting your search" : "Check back later for available subjects"}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredSubjects
                  .filter(subject => currentSubject ? subject.name === currentSubject : true)
                  .map((subject) => (
                  <Link
                    key={subject.subject_agent_id}
                    to={`/student/chat/new/subject/${subject.name}`}
                    className="block"
                  >
                    <div className="group relative cursor-pointer rounded-[24px] border border-transparent bg-white/8 p-3 text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/12 hover:shadow-md">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[16px] bg-white/10 ring-1 ring-white/10",
                          currentSubject === subject.name && "bg-white text-fuchsia-500 ring-white/20"
                        )}>
                          <BookOpen className={cn(
                            "w-4 h-4",
                            currentSubject === subject.name ? "text-fuchsia-500" : "text-cyan-100"
                          )} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate capitalize">
                            {subject.name}
                          </h4>
                          {subject.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {subject.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-[16px] hover:bg-white/10"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
