import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  MessageSquare,
  Clock,
  Calendar,
  User,
  Loader2,
  AlertCircle,
  ChevronRight,
  Bookmark,
  Sparkles,
} from "lucide-react";
import { getConversationHistory } from "@/config/services";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ConversationHistoryData, Agent, Session, Conversation } from "@/types/conversation";
import { cn } from "@/lib/utils";
import { appRoutes } from "@/config/routes";

export default function ConversationHistoryPage() {
  const [conversationData, setConversationData] = useState<ConversationHistoryData | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadConversationHistory();
  }, []);

  const loadConversationHistory = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await getConversationHistory(user.id);
      console.log("Conversation history loaded:", response);
      setConversationData(response);
      
      // Auto-select the agent that matches current subject, or first with conversations as fallback
      if (response.agents && response.agents.length > 0) {
        // Try to find agent matching current subject from URL or context
        const currentPath = window.location.pathname;
        let targetSubject = null;
        
        // Extract subject from URL path
        if (currentPath.includes('/math')) {
          targetSubject = 'Math';
        } else if (currentPath.includes('/science')) {
          targetSubject = 'Science';
        } else if (currentPath.includes('/physics')) {
          targetSubject = 'Physics';
        } else if (currentPath.includes('/chemistry')) {
          targetSubject = 'Chemistry';
        } else if (currentPath.includes('/biology')) {
          targetSubject = 'Biology';
        } else if (currentPath.includes('/english')) {
          targetSubject = 'English';
        } else if (currentPath.includes('/history')) {
          targetSubject = 'History';
        } else if (currentPath.includes('/geography')) {
          targetSubject = 'Geography';
        }
        
        console.log("Current path:", currentPath, "Target subject:", targetSubject);
        
        // Find agent matching the current subject
        const matchingAgent = response.agents.find(agent => 
          agent.subject === targetSubject
        );
        
        if (matchingAgent) {
          setSelectedAgentId(matchingAgent.agent_id);
          console.log("Selected agent matching current subject:", targetSubject, matchingAgent.subject);
        } else {
          // Fallback: Find agents with actual conversations
          const agentsWithConversations = response.agents.filter(agent => 
            agent.sessions && agent.sessions.length > 0 && 
            agent.sessions.some(session => session.conversations && session.conversations.length > 0)
          );
          
          console.log("Agents with conversations:", agentsWithConversations);
          
          if (agentsWithConversations.length > 0) {
            // Select the first agent that has conversations
            setSelectedAgentId(agentsWithConversations[0].agent_id);
            console.log("Auto-selected agent with conversations:", agentsWithConversations[0].subject);
          } else {
            // If no agent has conversations, select the first agent anyway
            setSelectedAgentId(response.agents[0].agent_id);
            console.log("No conversations found, selected first agent:", response.agents[0].subject);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load conversation history:", error);
      setError("Failed to load conversation history");
      toast.error("Failed to load conversation history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentClick = (agentId: string) => {
    console.log('handleAgentClick called with agentId:', agentId);
    setSelectedAgentId(agentId);
    setSelectedSessionId(null); // Reset session selection
    console.log('selectedAgentId set to:', agentId);
  };

  const handleSessionClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  // Derived state
  const selectedAgent = conversationData?.agents?.find(a => a.agent_id === selectedAgentId);
  const selectedSession = selectedAgent?.sessions?.find(s => s.session_id === selectedSessionId);
  const conversations = selectedSession?.conversations || [];

  // Debug logging for derived state
  console.log('Debug - selectedAgentId:', selectedAgentId);
  console.log('Debug - selectedAgent:', selectedAgent);
  console.log('Debug - selectedAgent sessions:', selectedAgent?.sessions);
  console.log('Debug - selectedSession:', selectedSession);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex h-[calc(100vh-4rem)]">
          <div className="w-64 border-r bg-muted/20 p-4">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-lg bg-muted animate-pulse">
                  <div className="h-4 bg-muted-foreground/20 rounded mb-2" />
                  <div className="h-3 bg-muted-foreground/10 rounded w-2/3" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
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
            <h3 className="font-medium mb-2">Error loading history</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadConversationHistory}>Try Again</Button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  console.log('Rendering sessions for agent:', selectedAgent?.subject, 'sessions:', selectedAgent?.sessions);

  return (
    <StudentLayout>
      <div className="flex h-[calc(100vh-4rem)] p-3 sm:p-4">
        {/* Agent Sidebar */}
        <div className="hidden w-72 overflow-hidden rounded-l-2xl border border-white/70 bg-white/85 shadow-xl shadow-slate-200/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 lg:block">
          <div className="signal-strip p-5 learning-grid">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Bookmark className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Saved Chats</h2>
            <p className="mt-1 text-xs text-muted-foreground">Choose a tutor collection</p>
          </div>
          <ScrollArea className="h-[calc(100%-8.5rem)]">
            <div className="p-3 space-y-2">
              {conversationData?.agents?.map((agent) => {
                const hasConversations = agent.sessions && agent.sessions.length > 0 && 
                  agent.sessions.some(session => session.conversations && session.conversations.length > 0);
                
                return (
                  <Button
                    key={agent.agent_id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto rounded-xl border p-3 transition-all",
                      selectedAgentId === agent.agent_id
                        ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/20"
                        : "border-transparent bg-white/45 hover:border-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/20",
                      !hasConversations && selectedAgentId !== agent.agent_id && "opacity-60"
                    )}
                    onClick={() => handleAgentClick(agent.agent_id)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ring-1",
                        selectedAgentId === agent.agent_id ? "bg-white/15 ring-white/20" : "bg-primary/10 ring-primary/10"
                      )}>
                        <Bot className={cn(
                          "w-4 h-4",
                          selectedAgentId === agent.agent_id ? "text-white" : "text-primary"
                        )} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className={cn(
                          "font-medium",
                          selectedAgentId === agent.agent_id && "text-white"
                        )}>
                          {agent.subject}
                        </div>
                        <div className={cn(
                          "text-xs",
                          selectedAgentId === agent.agent_id ? "text-white/70" : "text-muted-foreground"
                        )}>
                          {agent.total_conversations} conversation{agent.total_conversations !== 1 ? 's' : ''}
                          {!hasConversations && agent.total_conversations > 0 && (
                            <span className={cn(
                              "ml-2",
                              selectedAgentId === agent.agent_id ? "text-amber-300" : "text-amber-600"
                            )}>
                              (No chat data)
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        "w-4 h-4 opacity-50",
                        selectedAgentId === agent.agent_id && "text-white"
                      )} />
                    </div>
                  </Button>
                );
              })}
              
              {!conversationData?.agents?.length && (
                <div className="text-center py-8 px-4">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No agents found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Session List */}
        <div className="w-full overflow-hidden border border-white/70 bg-white/70 shadow-xl shadow-slate-200/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/65 lg:w-96 lg:border-l-0">
          <div className="border-b border-white/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {selectedAgent?.subject || 'Select Tutor'}
            </p>
            <h2 className="mt-1 text-xl font-bold">Session Timeline</h2>
          </div>
          <ScrollArea className="h-[calc(100%-4rem)]">
            <div className="p-3 space-y-2">
              {selectedAgent?.sessions?.map((session) => (
                <Button
                  key={session.session_id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto rounded-xl border p-4 transition-all",
                    selectedSessionId === session.session_id
                      ? "border-primary/30 bg-primary/10 shadow-md"
                      : "border-transparent bg-white/45 hover:border-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
                  )}
                  onClick={() => handleSessionClick(session.session_id)}
                >
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm mb-1">{session.title}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {session.message_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(session.created_at)}
                      </span>
                    </div>
                  </div>
                </Button>
              ))}
              
              {selectedAgent && !selectedAgent.sessions?.length && (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <h3 className="font-medium mb-2">No conversations for {selectedAgent.subject}</h3>
                  <p className="text-sm text-muted-foreground">
                    This {selectedAgent.subject} agent doesn't have any chat history yet. Start a conversation with {selectedAgent.subject} to see it here.
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() =>
                      navigate(appRoutes.student.newSubjectChat(selectedAgent.subject))
                    }
                  >
                    Start {selectedAgent.subject} Chat
                  </Button>
                </div>
              )}
              
              {!selectedAgent && (
                <div className="text-center py-8 px-4">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <h3 className="font-medium mb-2">Select an AI Teacher</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose an agent to view their conversation history
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Conversation Panel */}
        <div className="hidden flex-1 flex-col overflow-hidden rounded-r-2xl border border-l-0 border-white/70 bg-white/50 shadow-xl shadow-slate-200/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/45 lg:flex">
          {selectedSession ? (
            <>
              <div className="border-b border-white/70 bg-white/65 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/10">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedSession.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedSession.message_count} messages • Created {formatDate(selectedSession.created_at)}
                    </p>
                  </div>
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-5 space-y-5">
                  {conversations.map((conversation, index) => (
                    <div key={conversation.conversation_id} className="space-y-3">
                      {/* User Query */}
                      <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-950 text-white flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">You</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(conversation.timestamp)}
                            </span>
                          </div>
                          <div className="rounded-xl bg-slate-950 p-4 text-white shadow-lg shadow-slate-950/15">
                            <p className="text-sm">{conversation.query}</p>
                          </div>
                        </div>
                      </div>

                      {/* AI Response */}
                      <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                          <Bot className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{selectedAgent?.subject} Teacher</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(conversation.timestamp)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {conversation.feedback}
                            </Badge>
                          </div>
                          <div className="rounded-xl border border-white/70 bg-white/90 p-4 shadow-lg shadow-slate-200/70">
                            <div className="prose prose-sm max-w-none">
                              <div dangerouslySetInnerHTML={{ __html: conversation.response.replace(/\n/g, '<br>') }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {index < conversations.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                  
                  {!conversations.length && (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="font-medium mb-2">No messages in this session</h3>
                      <p className="text-sm text-muted-foreground">
                        This session doesn't contain any conversations yet
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="hero-card max-w-md p-8 text-center learning-grid">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2 text-xl">Select a session</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a session to view the conversation history
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
