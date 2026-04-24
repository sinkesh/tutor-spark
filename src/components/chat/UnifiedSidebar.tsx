import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getChatSessions, deleteChatSession, getStudentAgent } from "@/config/services";
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
  MoreVertical,
  Pencil,
  Trash2,
  Archive,
  Bot,
  Clock,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { appRoutes } from "@/config/routes";

interface UnifiedSidebarProps {
  currentSessionId?: string;
  onSessionSelect: (session: ChatSession) => void;
  onNewChat: () => void;
  onRenameSession?: (sessionId: string, currentTitle: string) => void;
  activeView: 'sessions' | 'subjects';
  collapsed?: boolean;
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
}: UnifiedSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadSessions();
    loadSubjects();
  }, []);

  const loadSessions = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingSessions(true);
      const response = await getChatSessions(user.id);
      const sessionsData = response.sessions || response.chat_sessions || response;
      
      const formattedSessions = (sessionsData || []).map((session: any) => {
        let agentName = session.agent_name;
        if (!agentName && session.title) {
          const subjectMatch = session.title.match(/New (\w+) Chat/);
          agentName = subjectMatch ? subjectMatch[1] : session.title.split(' ')[0];
        }
        
        return {
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
      });
      
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

  const handleArchiveSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await handleDeleteSession(sessionId, event);
    toast.success("Chat session archived");
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
    .filter(session => 
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.agent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.preview_message && session.preview_message.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(session => {
      // If we're in a specific subject context, only show sessions for that subject
      if (currentSubject) {
        console.log('Filtering session:', session.agent_name, 'for current subject:', currentSubject);
        return session.agent_name === currentSubject;
      }
      return true; // Show all sessions if not in a specific subject context
    })
    .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
                to={appRoutes.student.newSubjectChat(subject.name)}
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
                      "group relative cursor-pointer rounded-[24px] border p-3 transition-all hover:-translate-y-0.5 hover:shadow-md",
                      currentSessionId === session.id
                        ? "border-white/15 bg-white text-slate-950 shadow-lg shadow-slate-950/20"
                        : "border-transparent bg-white/8 text-white hover:border-white/10 hover:bg-white/12"
                    )}
                    onClick={() => onSessionSelect(session)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[16px] ring-1",
                        currentSessionId === session.id
                          ? "bg-slate-100 text-fuchsia-500 ring-slate-200"
                          : "bg-white/10 text-cyan-100 ring-white/10"
                      )}>
                        <Bot className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{session.title}</h4>
                          <Badge variant="secondary" className="capitalize rounded-full border border-white/60 bg-white/70 text-xs dark:border-white/10 dark:bg-white/10">
                            {session.agent_type}
                          </Badge>
                        </div>
                        
                        <p className={cn(
                          "text-xs mb-1",
                          currentSessionId === session.id ? "text-white/75" : "text-muted-foreground"
                        )}>
                          {session.agent_name}
                        </p>
                        
                        {session.preview_message && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {session.preview_message}
                          </p>
                        )}
                        
                        <div className={cn(
                          "flex items-center gap-2 mt-1 text-xs",
                          currentSessionId === session.id ? "text-white/75" : "text-muted-foreground"
                        )}>
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
                            className="rounded-[16px] opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                          {onRenameSession && (
                            <>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRenameSession(session.id, session.title);
                                }}
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={(e) => handleArchiveSession(session.id, e)}
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
                    to={appRoutes.student.newSubjectChat(subject.name)}
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
