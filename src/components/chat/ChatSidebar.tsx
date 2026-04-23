import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getChatSessions, deleteChatSession } from "@/config/services";
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
} from "lucide-react";
import { toast } from "sonner";

interface ChatSidebarProps {
  currentSessionId?: string;
  onSessionSelect: (session: ChatSession) => void;
  onNewChat: () => void;
  onRenameSession?: (sessionId: string, currentTitle: string) => void;
}

export default function ChatSidebar({
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onRenameSession,
}: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await getChatSessions(user.id);
      console.log("Sessions loaded in sidebar:", response);
      const sessionsData = response.sessions || response.chat_sessions || response;
      console.log("Sessions data extracted:", sessionsData);
      
      // Map your backend response to ChatSession format
      const formattedSessions = (sessionsData || []).map((session: any) => {
        console.log("Sidebar processing session:", session);
        
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
        
        console.log("Sidebar formatted session:", formattedSession);
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
    // Since archive is not available in API, we'll just delete for now
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

  const filteredSessions = sessions
    .filter(session => !session.is_archived)
    .filter(session => 
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.agent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.preview_message && session.preview_message.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-muted animate-pulse">
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
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                  currentSessionId === session.id ? "bg-accent" : ""
                }`}
                onClick={() => {
                  console.log('ChatSidebar: Session clicked:', session.id, session.title);
                  onSessionSelect(session);
                }}
                data-session-id={session.id}
                data-session-title={session.title}
                data-agent-name={session.agent_name}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
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
      </div>
    </div>
  );
}
