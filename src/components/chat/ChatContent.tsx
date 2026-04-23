import { useState, useEffect, createContext, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ChatWindow from "./ChatWindow";
import DocumentPreviewButton from "@/components/documents/DocumentPreviewButton";
import DocumentListModal from "@/components/documents/DocumentListModal";
import DocumentPreviewModal from "@/components/documents/DocumentPreviewModal";
import TopicsPreview from "./TopicsPreview";
import { ChatSession, ChatMessage, ChatContextType } from "@/types/chat";
import { AgentDocument, DocumentPreview } from "@/types/documents";
import {
  getChatSessions,
  createChatSession,
  getChatMessages,
  sendChatMessage,
  updateChatSession,
  deleteChatSession,
  updateMessageFeedback,
  getStudentAgentDocuments,
  previewDocument,
  getStudentAgent,
} from "@/config/services";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

interface ChatContentProps {
  agentType?: string;
  agentName?: string;
  agentId?: string;
  defaultTitle?: string;
  onBack?: () => void;
  onSessionSelect?: (sessionId: string) => void;
  onNewChat?: () => void;
  onRenameSession?: (sessionId: string, currentTitle: string) => void;
}

export default function ChatContent({
  agentType,
  agentName,
  agentId,
  defaultTitle,
  onBack,
  onSessionSelect,
  onNewChat,
  onRenameSession,
}: ChatContentProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  
  // Document preview state
  const [agentDocuments, setAgentDocuments] = useState<AgentDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentPreview | null>(null);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [isDocumentListModalOpen, setIsDocumentListModalOpen] = useState(false);
  const [isDocumentPreviewModalOpen, setIsDocumentPreviewModalOpen] = useState(false);
  
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Handle session selection from URL
  useEffect(() => {
    if (sessionId && sessions.length > 0) {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        switchSession(session.id);
      } else {
        // Session not found, navigate to chat home
        navigate("/student/chat");
      }
    }
  }, [sessionId, sessions.length]);

  // Update agent information when current session changes
  useEffect(() => {
    if (currentSession) {
      console.log('Current session updated:', currentSession);
      console.log('Agent ID:', currentSession.agent_id);
      console.log('Agent Name:', currentSession.agent_name);
      
      // If session has agent_id but we don't have it in props, update our state
      if (currentSession.agent_id && !agentId) {
        console.log('Session has agent_id, updating document functionality');
      }
    }
  }, [currentSession, agentId]);

  const loadSessions = async () => {
    if (!user?.id) return;
    
    try {
      const response = await getChatSessions(user.id);
      console.log("Sessions loaded:", response);
      const sessionsData = response.sessions || response.chat_sessions || response;
      console.log("Sessions data extracted:", sessionsData);
      
      // Also fetch student subjects to get proper agent IDs
      let studentSubjectsData: any[] = [];
      try {
        const studentSubjectsResponse = await getStudentAgent(user.id);
        console.log("Student subjects loaded:", studentSubjectsResponse);
        studentSubjectsData = studentSubjectsResponse.student_subjects || [];
      } catch (error) {
        console.log("Could not load student subjects, using fallback logic");
      }
      
      // Map your backend response to ChatSession format
      const formattedSessions = (sessionsData || []).map((session: any) => {
        console.log("Processing session:", session);
        
        // Extract subject from title or use a mapping
        let sessionAgentName = session.agent_name;
        if (!sessionAgentName && session.title) {
          // Extract subject from title like "New Science Chat" -> "Science"
          const subjectMatch = session.title.match(/New (\w+) Chat/);
          sessionAgentName = subjectMatch ? subjectMatch[1] : session.title.split(' ')[0];
        }
        
        // Try to extract agent_id from various sources
        let extractedAgentId = session.agent_id;
        
        // If no agent_id, try to find it from student subjects
        if (!extractedAgentId && sessionAgentName && studentSubjectsData.length > 0) {
          const matchingSubject = studentSubjectsData.find((subject: any) => 
            subject.name?.toLowerCase() === sessionAgentName?.toLowerCase()
          );
          
          if (matchingSubject?.subject_agent_id) {
            extractedAgentId = matchingSubject.subject_agent_id;
            console.log(`Found agent ID for ${sessionAgentName}: ${extractedAgentId}`);
          }
        }
        
        // If still no agent_id, try to construct it from agent name
        if (!extractedAgentId && sessionAgentName) {
          // Common patterns for agent IDs based on your API example
          const agentIdPatterns = [
            `agent_${sessionAgentName.toLowerCase()}`,
            `${sessionAgentName.toLowerCase()}_agent`,
            sessionAgentName.toLowerCase()
          ];
          
          // Try to find a matching pattern or use the first one
          extractedAgentId = agentIdPatterns[0];
          console.log(`Constructed agent ID for ${sessionAgentName}: ${extractedAgentId}`);
        }
        
        // Use fallback from props if still no agent_id
        if (!extractedAgentId && agentId) {
          extractedAgentId = agentId;
        }
        
        const formattedSession = {
          id: session.chat_session_id || session.id,
          user_id: user.id,
          title: session.title,
          agent_type: session.agent_type || 'subject',
          agent_name: sessionAgentName || 'General',
          agent_id: extractedAgentId, // Use extracted or fallback agent ID
          created_at: session.created_at || new Date().toISOString(),
          updated_at: session.updated_at || new Date().toISOString(),
          last_message_at: session.last_message_at || session.created_at || new Date().toISOString(),
          message_count: session.message_count || 0,
          is_archived: session.is_archived || false
        };
        
        console.log("Formatted session:", formattedSession);
        return formattedSession;
      });
      
      console.log("Formatted sessions:", formattedSessions);
      setSessions(formattedSessions);
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
      toast.error("Failed to load chat sessions");
    }
  };

  const loadMessages = async (sessionId: string) => {
    if (!user?.id) return;
    
    try {
      const response = await getChatMessages(user.id, sessionId);
      console.log("Messages loaded:", response);
      
      // Handle your backend history response structure
      const historyData = response.history || response.messages || [];
      console.log("History data:", historyData);
      
      // Map your backend history to ChatMessage format
      const formattedMessages = historyData.map((msg: any) => {
        console.log("Processing message:", msg);
        
        // User message
        const userMessage: ChatMessage = {
          id: msg._id || `user_${Date.now()}`,
          session_id: msg.chat_session_id,
          role: "user",
          content: msg.query,
          message_type: "text",
          created_at: msg.timestamp,
          conversation_id: msg._id,
        };
        
        // AI response message
        const aiMessage: ChatMessage = {
          id: `${msg._id}_response` || `ai_${Date.now()}`,
          session_id: msg.chat_session_id,
          role: "assistant",
          content: msg.response,
          message_type: "text",
          created_at: msg.timestamp,
          conversation_id: msg._id,
          feedback: msg.feedback === 'like' ? 'like' : msg.feedback === 'dislike' ? 'dislike' : undefined,
        };
        
        return [userMessage, aiMessage];
      }).flat().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      console.log("Formatted messages:", formattedMessages);
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const createSession = async (agentType: string, sessionAgentName: string, sessionAgentId?: string) => {
    if (!user?.id || isCreating) return;
    
    try {
      setIsCreating(true);
      setIsLoading(true);
      const sessionData = {
        student_id: user.id,
        title: defaultTitle || `New ${sessionAgentName} Chat`,
      };

      console.log("Creating session with data:", sessionData);
      const response = await createChatSession(sessionData);
      console.log("Session creation response:", response);
      
      // Handle your actual response structure
      const newSession: ChatSession = {
        id: response.chat_session_id,
        user_id: user.id,
        title: response.title,
        agent_type: agentType as 'subject' | 'class' | 'course' | 'teacher',
        agent_name: sessionAgentName || 'Mathematics', // Default to Mathematics
        agent_id: sessionAgentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        message_count: 0,
        is_archived: false
      };
      console.log("Extracted session:", newSession);
      
      if (!newSession || !newSession.id) {
        console.error("Invalid session response:", response);
        toast.error("Invalid session response from server");
        return;
      }
      
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      setMessages([]);
      
      // Navigate to the new session
      navigate(`/student/chat/session/${newSession.id}`, { replace: true });
      
      toast.success("New chat session created");
    } catch (error) {
      console.error("Failed to create session:", error);
      toast.error("Failed to create chat session");
    } finally {
      setIsLoading(false);
      setIsCreating(false);
    }
  };

  const switchSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;
      
      setCurrentSession(session);
      
      // Load messages for this session using the proper loadMessages function
      await loadMessages(sessionId);
      
      // Update URL
      navigate(`/student/chat/session/${sessionId}`);
      
      // Notify parent component
      if (onSessionSelect) {
        onSessionSelect(sessionId);
      }
    } catch (error) {
      console.error("Failed to switch session:", error);
      toast.error("Failed to load session");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentSession || !user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        session_id: currentSession.id,
        role: "user",
        content,
        message_type: "text",
        created_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Send to backend using existing agent-query API
      const response = await sendChatMessage({
        student_id: user.id,
        subject: currentSession.agent_name || 'Mathematics', // Use agent_name instead of 'General'
        class_name: user.class || 'Class10A',
        query: content,
        chat_session_id: currentSession.id,
      });
      
      // Add AI response
      const aiMessage: ChatMessage = {
        id: response.conversation_id || `ai-${Date.now()}`,
        session_id: currentSession.id,
        conversation_id: response.conversation_id,
        role: "assistant",
        content: response.response,
        message_type: "text",
        created_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update session in list
      setSessions(prev => prev.map(s => 
        s.id === currentSession.id 
          ? { ...s, last_message_at: new Date().toISOString(), message_count: s.message_count + 2 }
          : s
      ));
      
    } catch (error) {
      console.error("Failed to send message:", error);
      
      // Show specific error message
      if (error.response?.status === 500) {
        toast.error("Server error. Please try again or contact support.");
      } else if (error.response?.status === 404) {
        toast.error("Service not available. Please try again later.");
      } else {
        toast.error("Failed to send message. Please try again.");
      }
      
      // Remove the temporary user message
      setMessages(prev => prev.filter(m => m.id !== `temp-${Date.now()}`));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!user?.id) return;
    
    try {
      await deleteChatSession(user.id, sessionId);
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
        navigate("/student/chat");
      }
      
      toast.success("Chat session deleted");
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete session");
    }
  };

  const renameSession = async (sessionId: string, title: string) => {
    if (!user?.id) return;
    
    try {
      await updateChatSession(user.id, sessionId, { title });
      
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, title } : s
      ));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, title } : null);
      }
      
      toast.success("Chat session renamed");
    } catch (error) {
      console.error("Failed to rename session:", error);
      toast.error("Failed to rename session");
    }
  };

  const archiveSession = async (sessionId: string) => {
    // Your API doesn't have archive, so we'll just delete for now
    await deleteSession(sessionId);
    toast.success("Chat session archived");
  };

  const handleFeedback = async (messageId: string, feedback: 'like' | 'dislike') => {
    try {
      await updateMessageFeedback({
        conversation_id: messageId,
        feedback: feedback === 'like' ? '👍' : '👎',
        rating: feedback === 'like' ? 5 : 1,
      });
      
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, feedback } : m
      ));
      
      toast.success("Feedback submitted");
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback");
    }
  };

  const handleNewChat = () => {
    if (agentType && agentName) {
      createSession(agentType, agentName, agentId);
    } else {
      // Navigate to agent selection or show modal
      navigate("/student/explore");
    }
    
    if (onNewChat) {
      onNewChat();
    }
  };

  const handleRenameSession = (sessionId: string, currentTitle: string) => {
    const newTitle = prompt("Enter new title:", currentTitle);
    if (newTitle && newTitle.trim() && newTitle !== currentTitle) {
      renameSession(sessionId, newTitle.trim());
    }
    
    if (onRenameSession) {
      onRenameSession(sessionId, currentTitle);
    }
  };

  // Document preview functions (simplified for this component)
  const handleDocumentPreviewClick = () => {
    toast.info("Document preview functionality available in full chat layout");
  };

  const closeDocumentModals = () => {
    setIsDocumentListModalOpen(false);
    setIsDocumentPreviewModalOpen(false);
    setSelectedDocument(null);
    setDocumentError(null);
  };

  const chatContextValue: ChatContextType = {
    sessions,
    currentSession,
    messages,
    isLoading,
    createSession,
    switchSession,
    sendMessage,
    deleteSession,
    renameSession,
    archiveSession,
    loadSessions,
    loadMessages: switchSession,
  };

  return (
    <ChatContext.Provider value={chatContextValue}>
      <div className="flex-1 flex flex-col h-full bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button variant="ghost" size="icon-sm" onClick={onBack}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  🤖
                </div>
                <div>
                  <h1 className="font-semibold">
                    {currentSession?.title || (agentName ? `${agentName} Chat` : "AI Chat")}
                  </h1>
                  {currentSession && (
                    <p className="text-xs text-muted-foreground">
                      {currentSession.agent_name} • {currentSession.message_count} messages
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DocumentPreviewButton
                agentId={currentSession?.agent_id}
                agentName={currentSession?.agent_name}
                documentCount={agentDocuments.length}
                isLoading={isLoadingDocuments}
                onClick={handleDocumentPreviewClick}
              />
              
              <Button
                onClick={handleNewChat}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1">
          {currentSession ? (
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              onFeedback={handleFeedback}
              placeholder={`Ask anything about ${currentSession.agent_name}...`}
              agentId={currentSession.agent_id}
              agentName={currentSession.agent_name}
            />
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-6 space-y-8">
                {/* Welcome Section */}
                <div className="text-center">
                  <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    🤖
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Welcome to AI Chat</h2>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    Select an existing conversation or start a new chat to begin learning with your AI tutor.
                  </p>
                  <Button onClick={handleNewChat} size="lg" className="mb-8">
                    Start New Chat
                  </Button>
                </div>
                
                {/* Topics Preview - Only show when no active session */}
                <TopicsPreview enabled={!currentSession} />
              </div>
            </div>
          )}
        </div>

        {/* Document Modals */}
        <DocumentListModal
          isOpen={isDocumentListModalOpen}
          onClose={closeDocumentModals}
          documents={agentDocuments}
          isLoading={isLoadingDocuments}
          error={documentError}
          onDocumentSelect={(document) => {
            // Handle document selection
            console.log('Document selected:', document);
          }}
        />

        <DocumentPreviewModal
          isOpen={isDocumentPreviewModalOpen}
          onClose={closeDocumentModals}
          document={selectedDocument}
          isLoading={isLoadingPreview}
          error={documentError}
        />
      </div>
    </ChatContext.Provider>
  );
}
