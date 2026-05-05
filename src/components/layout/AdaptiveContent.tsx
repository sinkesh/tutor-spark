import { useState, useEffect, createContext, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ChatWindow from "@/components/chat/ChatWindow";
import TopicsDropdown from "@/components/chat/TopicsDropdown";
import DocumentPreviewButton from "@/components/documents/DocumentPreviewButton";
import SplitDocumentView from "@/components/documents/SplitDocumentView";
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
  getStudentDetails,
} from "@/config/services";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Bot, Sparkles, MessageSquare, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentClick } from "@/hooks/useDocumentClick";
import { BASE_URL, VERSION } from "@/config/api_urls";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const showcaseMetrics = [
  { label: "Active tutors", value: "24/7", icon: Sparkles },
  { label: "Learning modes", value: "3", icon: MessageSquare },
  { label: "Smart resources", value: "Docs+", icon: BookOpen },
];

const learningHighlights = [
  "Adaptive explanations tuned to your pace",
  "Context-aware answers with topic continuity",
  "Revision, practice, and concept mastery in one flow",
];

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

interface AdaptiveContentProps {
  viewType: 'dashboard' | 'chat' | 'explore';
  currentSessionId?: string;
  onSessionSelect?: (session: ChatSession) => void;
  onNewChat?: () => void;
  onRenameSession?: (sessionId: string, currentTitle: string) => void;
  onSessionCreated?: () => void; // Called after new session is created
  agentType?: string;
  agentName?: string;
  agentId?: string;
  defaultTitle?: string;
  onBack?: () => void;
}

interface StudentSubject {
  subject_agent_id: string;
  name: string;
  description?: string;
}

export default function AdaptiveContent({
  viewType,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onRenameSession,
  onSessionCreated,
  agentType,
  agentName,
  agentId,
  defaultTitle,
  onBack,
}: AdaptiveContentProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Document preview state
  const [agentDocuments, setAgentDocuments] = useState<AgentDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentPreview | null>(null);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [isSplitViewOpen, setIsSplitViewOpen] = useState(false);
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [externalInputValue, setExternalInputValue] = useState<string | undefined>(undefined);

  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  // Global document click handler
  useDocumentClick({
    enabled: true,
    onDocumentClick: async (document: AgentDocument) => {
      console.log('Global document click:', document);
      // Open split view and select the document
      if (!isSplitViewOpen) {
        await loadAgentDocuments();
        setIsSplitViewOpen(true);
      }
      // Find and select the document
      const targetDoc = agentDocuments.find(doc => doc.id === document.id);
      if (targetDoc) {
        handleDocumentSelect(targetDoc);
      }
    }
  });

  // Reset currentSession when URL sessionId changes to a different session
  useEffect(() => {
    const targetSessionId = sessionId || currentSessionId;
    if (targetSessionId && currentSession && currentSession.id !== targetSessionId) {
      console.log('URL session changed, resetting currentSession from', currentSession.id, 'to', targetSessionId);
      setCurrentSession(null);
      setMessages([]);
    }
  }, [sessionId, currentSessionId, currentSession?.id]);

  // Handle session selection from URL or props
  useEffect(() => {
    const targetSessionId = sessionId || currentSessionId;
    if (!targetSessionId || viewType !== 'chat') return;

    const session = sessions.find(s => s.id === targetSessionId);
    if (session) {
      if (!currentSession || currentSession.id !== targetSessionId) {
        const currentPath = window.location.pathname;
        const targetPath = `/student/chat/session/${targetSessionId}`;
        switchSession(session.id, currentPath === targetPath);
      }
      return;
    }

    // Session not found - load sessions and try again (only once per targetSessionId)
    console.log('Session not found in current list, reloading sessions...');
    loadSessions().then((freshSessions) => {
      const freshSessionsArray = Array.isArray(freshSessions) ? freshSessions : sessions;
      const reloadedSession = freshSessionsArray.find((s: any) =>
        s.id === targetSessionId || s.chat_session_id === targetSessionId || s.session_id === targetSessionId
      );
      if (reloadedSession) {
        const currentPath = window.location.pathname;
        const targetPath = `/student/chat/session/${targetSessionId}`;
        const sid = reloadedSession.chat_session_id || reloadedSession.session_id || reloadedSession.id || reloadedSession._id;

        if (!sid) {
          console.error('Reloaded session has no ID:', reloadedSession);
          return;
        }

        const formattedSession: ChatSession = {
          id: sid,
          user_id: user?.id || '',
          title: reloadedSession.session_name || reloadedSession.title || 'Untitled Chat',
          agent_type: reloadedSession.agent_type || 'subject',
          agent_name: reloadedSession.subject || reloadedSession.agent_name || 'General',
          agent_id: reloadedSession.agent_id,
          created_at: reloadedSession.created_at || new Date().toISOString(),
          updated_at: reloadedSession.last_message_at || reloadedSession.updated_at || reloadedSession.created_at || new Date().toISOString(),
          last_message_at: reloadedSession.last_message_at || reloadedSession.created_at || new Date().toISOString(),
          message_count: reloadedSession.message_count || 0,
          is_archived: reloadedSession.is_active === false || reloadedSession.is_archived === true
        };
        setSessions(prev => {
          const exists = prev.find(s => s.id === formattedSession.id);
          if (exists) return prev;
          return [formattedSession, ...prev];
        });
        switchSession(formattedSession.id, currentPath === targetPath, formattedSession);
      } else {
        console.log('Session still not found after reload, staying on current page');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, currentSessionId, viewType]);

  // Update agent information when current session changes
  useEffect(() => {
    if (currentSession) {
      if (currentSession.agent_id && (!currentSession.agent_id.startsWith('agent_') || currentSession.agent_id.includes(' ') || currentSession.agent_id === 'agent_ai tutor')) {
        console.log('Session has invalid agent_id, updating document functionality');

        // Try to resolve the agent ID asynchronously
        const resolveSessionAgentId = async () => {
          try {
            const studentSubjectsResponse = await getStudentAgent(user.id);
            const allSubjects = [
              ...(studentSubjectsResponse.student_subjects || []),
              ...(studentSubjectsResponse.general_subjects || []),
            ];

            // If we have a current session with agent_name, try to find matching subject
            if (currentSession?.agent_name) {
              const matchingSubject = allSubjects.find((subject: any) =>
                subject.name?.toLowerCase() === currentSession.agent_name?.toLowerCase()
              );

              if (matchingSubject?.subject_agent_id) {
                const resolvedAgentId = matchingSubject.subject_agent_id;
                console.log('Resolved session agent ID from name:', resolvedAgentId);

                // Update the current session with the found agent ID
                setCurrentSession(prev => prev ? { ...prev, agent_id: resolvedAgentId } : null);
              }
            }
          } catch (error) {
            console.error('Failed to resolve session agent ID:', error);
          }
        };

        resolveSessionAgentId();
      }
    }
  }, [currentSession, agentId, user?.id]);

  const loadSessions = async () => {
    if (!user?.id) return;

    try {
      const response = await getChatSessions(user.id);
      const sessionsData = response.sessions || response.chat_sessions || response;

      const formattedSessions = (sessionsData || []).map((session: any) => {
        // Backend API returns: session_id, subject, session_name, message_count, is_active, created_at, last_message_at
        const sessionId = session.session_id || session.chat_session_id || session.id || session._id;
        const title = session.session_name || session.title || 'Untitled Chat';
        const agentName = session.subject || session.agent_name || 'General';
        const agentType = session.agent_type || 'subject';

        return {
          id: sessionId,
          user_id: user.id,
          title,
          agent_type: agentType,
          agent_name: agentName,
          agent_id: session.agent_id || undefined,
          created_at: session.created_at || new Date().toISOString(),
          updated_at: session.last_message_at || session.updated_at || session.created_at || new Date().toISOString(),
          last_message_at: session.last_message_at || session.created_at || new Date().toISOString(),
          message_count: session.message_count || 0,
          is_archived: session.is_active === false || session.is_archived === true
        };
      }).filter((s: ChatSession) => s.id);

      console.log('AdaptiveContent: Loaded sessions:', formattedSessions.length);
      setSessions(formattedSessions);
      return formattedSessions;
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
      toast.error("Failed to load chat sessions");
      return [];
    }
  };

  const loadMessages = async (sessionId: string) => {
    if (!user?.id) return;

    try {
      const response = await getChatMessages(user.id, sessionId);
      const historyData = response.history || response.messages || [];

      const parseHistoryResponse = (msg: any): { intent: string | null; data: any } => {
        let rawResponse = msg.response;
        let detectedIntent: string | null = msg.intent || null;

        // Some backends serialize response as a JSON string
        if (typeof rawResponse === 'string') {
          try {
            rawResponse = JSON.parse(rawResponse);
          } catch {
            // leave as string
          }
        }

        // Check for intent nested inside response object
        if (!detectedIntent && typeof rawResponse === 'object' && rawResponse?.intent) {
          detectedIntent = rawResponse.intent;
        }

        // Also check if backend stores structured data under evaluation directly
        if (!detectedIntent && msg.evaluation) {
          if (msg.evaluation.quiz_data) detectedIntent = 'quiz';
          else if (msg.evaluation.study_plan_data) detectedIntent = 'study_plan';
        }

        // Fallback: detect by shape when intent is missing
        if (!detectedIntent && typeof rawResponse === 'object' && rawResponse !== null) {
          if (rawResponse?.questions && Array.isArray(rawResponse.questions)) {
            detectedIntent = 'quiz';
          } else if (rawResponse?.content?.sections || rawResponse?.content?.key_points) {
            detectedIntent = 'notes';
          } else if (rawResponse?.plan || rawResponse?.topic_details) {
            detectedIntent = 'study_plan';
          } else if (typeof rawResponse === 'string' && rawResponse.length > 100) {
            detectedIntent = 'study';
          }
        }

        return { intent: detectedIntent, data: rawResponse };
      };

      const formattedMessages = historyData.map((msg: any) => {
        const msgId = msg.id || msg._id || `msg_${Date.now()}`;
        const sessionIdForMsg = msg.chat_session_id || msg.student_id || sessionId;
        const createdAt = msg.timestamp || msg.created_at || new Date().toISOString();

        const { intent, data: responseObj } = parseHistoryResponse(msg);
        let aiMessage: ChatMessage;

        if (intent === 'quiz') {
          const quizData = msg.evaluation?.quiz_data || responseObj;
          aiMessage = {
            id: `${msgId}_ai`,
            session_id: sessionIdForMsg,
            role: 'assistant',
            content: quizData?.title || 'Quiz',
            message_type: 'quiz',
            metadata: {
              quiz: {
                title: quizData?.title,
                description: quizData?.description,
                questions: quizData?.questions || [],
                current_question_index: 0,
                user_answers: {},
              },
            },
            created_at: createdAt,
            conversation_id: msg.conversation_id || msgId,
            feedback: msg.feedback === 'like' ? 'like' : msg.feedback === 'dislike' ? 'dislike' : undefined,
          };
        } else if (intent === 'notes') {
          const notesData = responseObj;
          const content = notesData?.content || {};
          aiMessage = {
            id: `${msgId}_ai`,
            session_id: sessionIdForMsg,
            role: 'assistant',
            content: notesData?.title || 'Notes',
            message_type: 'notes',
            metadata: {
              notes: {
                title: notesData?.title,
                description: notesData?.description,
                format: notesData?.format,
                detail_level: notesData?.detail_level,
                sections: content?.sections || [],
                key_points: content?.key_points || [],
                definitions: content?.definitions || [],
                summary: content?.summary || '',
              },
            },
            created_at: createdAt,
            conversation_id: msg.conversation_id || msgId,
            feedback: msg.feedback === 'like' ? 'like' : msg.feedback === 'dislike' ? 'dislike' : undefined,
          };
        } else if (intent === 'study_plan') {
          const studyPlanData = msg.evaluation?.study_plan_data || {};
          const responseData = responseObj || {};
          const topicDetails = responseData.topic_details || {};

          const schedule = studyPlanData.schedule?.length > 0
            ? studyPlanData.schedule
            : (responseData.plan || []).map((p: any) => ({
                day: p.day,
                focus: p.focus,
                tasks: p.tasks || [],
                duration_minutes: p.duration_minutes,
                resources: p.resources || [],
              }));

          aiMessage = {
            id: `${msgId}_ai`,
            session_id: sessionIdForMsg,
            role: 'assistant',
            content: topicDetails.title || studyPlanData.title || 'Study Plan',
            message_type: 'study_plan',
            metadata: {
              study_plan: {
                title: topicDetails.title || studyPlanData.title,
                description: topicDetails.description || studyPlanData.description,
                level: topicDetails.level || studyPlanData.level,
                duration_days: topicDetails.duration_days || studyPlanData.duration_days,
                schedule,
                milestones: studyPlanData.milestones || [],
                key_concepts: studyPlanData.key_concepts || responseData.subtopics || [],
                subtopics: studyPlanData.subtopics || [],
                summary: studyPlanData.summary || responseData.summary || '',
                full_plan: responseData.full_plan || '',
                study_plan: responseData.full_plan || '',
              },
            },
            created_at: createdAt,
            conversation_id: msg.conversation_id || msgId,
            feedback: msg.feedback === 'like' ? 'like' : msg.feedback === 'dislike' ? 'dislike' : undefined,
          };
        } else if (intent === 'study') {
          let textContent = '';
          if (typeof responseObj === 'string') {
            textContent = responseObj;
          } else if (typeof responseObj === 'object' && responseObj !== null) {
            textContent = responseObj.summary || responseObj.title || responseObj.response || JSON.stringify(responseObj);
          }

          aiMessage = {
            id: `${msgId}_ai`,
            session_id: sessionIdForMsg,
            role: 'assistant',
            content: textContent,
            message_type: 'study',
            created_at: createdAt,
            conversation_id: msg.conversation_id || msgId,
            feedback: msg.feedback === 'like' ? 'like' : msg.feedback === 'dislike' ? 'dislike' : undefined,
          };
        } else {
          // Plain text fallback — avoid dumping raw objects
          let textContent = '';
          if (typeof responseObj === 'string') {
            textContent = responseObj;
          } else if (typeof responseObj === 'object' && responseObj !== null) {
            textContent = responseObj.summary || responseObj.title || JSON.stringify(responseObj);
          }

          aiMessage = {
            id: `${msgId}_ai`,
            session_id: sessionIdForMsg,
            role: "assistant",
            content: textContent,
            message_type: "text",
            created_at: createdAt,
            conversation_id: msg.conversation_id || msgId,
            feedback: msg.feedback === 'like' ? 'like' : msg.feedback === 'dislike' ? 'dislike' : undefined,
          };
        }

        const userMessage: ChatMessage = {
          id: `${msgId}_user`,
          session_id: sessionIdForMsg,
          role: "user",
          content: msg.query || msg.content || "",
          message_type: "text",
          created_at: createdAt,
          conversation_id: msg.conversation_id || msgId,
        };

        return [userMessage, aiMessage];
      }).flat().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const ensureClass = async (): Promise<string | null> => {
    if (user?.class) return user.class;
    if (!user?.id || user?.role !== "student") return null;
    try {
      const details = await getStudentDetails(user.id);
      console.log("Fetched student details for class_name:", details);
      const cls = (details as any).student_details?.class_name || details.class_name || (details as any).class || "";
      if (cls) {
        updateUser({ class: cls });
        return cls;
      }
    } catch (err) {
      console.error("Failed to fetch class_name on demand:", err);
    }
    return null;
  };

  const createSession = async (agentType: string, agentName: string, agentId?: string) => {
    if (!user?.id || isCreating) return null;
    const userClass = await ensureClass();
    if (!userClass) {
      toast.error("Class information is missing. Could not load from profile.");
      return null;
    }

    try {
      setIsCreating(true);
      setIsLoading(true);

      // Resolve agent ID and actual subject name
      let finalAgentId = agentId;
      let actualSubjectName = agentName;

      // Only resolve agent ID from backend if we have invalid/missing data
      const needsResolution = !agentName ||
        agentName === 'AI Tutor' ||
        agentName === 'New' ||
        agentName === 'General' ||
        !finalAgentId ||
        (finalAgentId && !finalAgentId.startsWith('agent_'));

      if (needsResolution) {
        try {
          const studentSubjectsResponse = await getStudentAgent(user.id);
          const allSubjects = [
            ...(studentSubjectsResponse.student_subjects || []),
            ...(studentSubjectsResponse.general_subjects || []),
          ];

          // Try to find matching subject by name
          const matchingSubject = allSubjects.find((subject: any) =>
            subject.name?.toLowerCase() === agentName?.toLowerCase()
          );

          if (matchingSubject) {
            finalAgentId = matchingSubject.subject_agent_id;
            actualSubjectName = matchingSubject.name;
            console.log('Session creation - found matching subject:', matchingSubject.name, '->', finalAgentId);
          } else {
            // Use the provided agentName and generate a fallback agent ID
            console.log('Session creation - no matching subject found, using provided agentName:', agentName);
            actualSubjectName = agentName;
            if (!finalAgentId || !finalAgentId.startsWith('agent_')) {
              finalAgentId = `agent_${agentName.toLowerCase().replace(/\s+/g, '')}`;
              console.log('Session creation - generated agent ID:', finalAgentId);
            }
          }
        } catch (error) {
          console.error('Failed to resolve agent ID and subject name during session creation:', error);
        }
      }

      const sessionData = {
        student_id: user.id,
        subject: actualSubjectName,
        class_name: userClass,
        title: defaultTitle || `New ${actualSubjectName} Chat`,
        session_name: `${actualSubjectName} Session`,
        agent_type: agentType || 'subject',
        agent_name: actualSubjectName,
        agent_id: finalAgentId || '',
      };

      const response = await createChatSession(sessionData);

      const newSession: ChatSession = {
        id: response.chat_session_id,
        user_id: user.id,
        title: response.title,
        agent_type: agentType as 'subject' | 'class' | 'course' | 'teacher',
        agent_name: actualSubjectName || 'General',
        agent_id: finalAgentId, // Use the resolved agent ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        message_count: 0,
        is_archived: false
      };

      if (!newSession || !newSession.id) {
        console.error("Invalid session response:", response);
        toast.error("Invalid session response from server");
        return null;
      }

      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      setMessages([]);

      // Update local session state with resolved agent ID if different from backend response
      if (finalAgentId && finalAgentId !== newSession.agent_id) {
        console.log('Updating local session with resolved agent ID:', finalAgentId);
        const updatedSession = { ...newSession, agent_id: finalAgentId, agent_name: actualSubjectName };
        setCurrentSession(updatedSession);
        setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
      }

      navigate(`/student/chat/session/${newSession.id}`, { replace: true });
      toast.success("New chat session created");

      // Notify parent that session was created
      onSessionCreated?.();

      return newSession;
    } catch (error) {
      console.error("Failed to create session:", error);
      toast.error("Failed to create chat session");
      return null;
    } finally {
      setIsLoading(false);
      setIsCreating(false);
    }
  };

  const switchSession = async (sessionId: string, skipNavigation = false, sessionObject?: ChatSession) => {
    try {
      setIsLoading(true);
      // Use provided session object if available, otherwise look it up
      const session = sessionObject || sessions.find(s => s.id === sessionId);
      if (!session) {
        console.error('Session not found:', sessionId);
        toast.error("Session not found");
        return;
      }

      setCurrentSession(session);

      // Load message history for this session
      await loadMessages(sessionId);

      // Only navigate if not already at this URL and skipNavigation is false
      if (!skipNavigation) {
        const targetPath = `/student/chat/session/${sessionId}`;
        if (window.location.pathname !== targetPath) {
          navigate(targetPath);
        }
      }

      if (onSessionSelect) {
        onSessionSelect(session);
      }

      console.log('AdaptiveContent: Session switch complete:', session.title);
    } catch (error) {
      console.error("Failed to switch session:", error);
      toast.error("Failed to load session");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    console.log("sendMessage called:", { content, currentSession, userId: user?.id, agentType, agentName, agentId });
    if (!user?.id) {
      console.warn("sendMessage blocked: user.id is missing");
      toast.error("User not authenticated. Please log in again.");
      return;
    }
    const userClass = await ensureClass();
    if (!userClass) {
      toast.error("Class information is missing. Could not load from profile.");
      return;
    }

    let session = currentSession;

    // Auto-create a session if none exists and we have agent info
    if (!session) {
      if (!agentType || !agentName) {
        console.warn("sendMessage blocked: no session and no agent info to create one");
        toast.error("No active chat session. Please select a subject first.");
        return;
      }
      console.log("Auto-creating session before sending message...", { agentType, agentName, agentId });
      const newSession = await createSession(agentType, agentName, agentId);
      if (!newSession) {
        console.error("Failed to auto-create session");
        toast.error("Failed to start chat session. Please try again.");
        return;
      }
      session = newSession;
      console.log("Auto-created session:", session.id);
    }

    try {
      setIsLoading(true);

      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        session_id: session.id,
        role: "user",
        content,
        message_type: "text",
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Exit quiz command detection
      const exitCommands = ['exit', 'quit', 'quit quiz', 'stop', 'stop quiz'];
      const isExitCommand = exitCommands.includes(content.trim().toLowerCase());
      const lastUnfinishedQuiz = [...messages].reverse().find(
        (m: ChatMessage) => m.message_type === 'quiz' && !m.metadata?.quiz?.final_score
      );

      if (isExitCommand && lastUnfinishedQuiz) {
        handleUpdateMessage(lastUnfinishedQuiz.id, {
          metadata: {
            ...lastUnfinishedQuiz.metadata,
            quiz: { ...lastUnfinishedQuiz.metadata!.quiz!, final_score: 'Quiz exited' },
          },
        });

        const followUp: ChatMessage = {
          id: `ai-${Date.now()}`,
          session_id: session.id,
          role: 'assistant',
          content: 'Quiz exited. What would you like to learn next?',
          message_type: 'text',
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, followUp]);
        setIsLoading(false);
        return;
      }

      // Resolve the actual subject name from student subjects only if invalid
      let actualSubject = session.agent_name;
      if (actualSubject === 'AI Tutor' || actualSubject === 'New' || actualSubject === 'General' || !actualSubject) {
        try {
          const studentSubjectsResponse = await getStudentAgent(user.id);
          const allSubjects = [
            ...(studentSubjectsResponse.student_subjects || []),
            ...(studentSubjectsResponse.general_subjects || []),
          ];

          // If we have agent_id, find the matching subject
          if (session.agent_id) {
            const matchingSubject = allSubjects.find((subject: any) =>
              subject.subject_agent_id === session.agent_id
            );
            if (matchingSubject?.name) {
              actualSubject = matchingSubject.name;
              console.log('Resolved subject from agent_id:', session.agent_id, '->', actualSubject);
            } else {
              // Try to extract subject from session title as fallback
              const titleMatch = session.title?.match(/New (\w+) Chat/);
              if (titleMatch) {
                actualSubject = titleMatch[1];
                console.log('Resolved subject from title:', session.title, '->', actualSubject);
              } else {
                // Last resort: use first available subject
                if (allSubjects.length > 0) {
                  actualSubject = allSubjects[0].name;
                  console.log('Using first available subject as last resort:', actualSubject);
                }
              }
            }
          } else {
            // No agent_id, try to extract from title
            const titleMatch = session.title?.match(/New (\w+) Chat/);
            if (titleMatch) {
              actualSubject = titleMatch[1];
              console.log('Resolved subject from title (no agent_id):', session.title, '->', actualSubject);
            } else {
              // Last resort: use first available subject
              if (allSubjects.length > 0) {
                actualSubject = allSubjects[0].name;
                console.log('Using first available subject as last resort (no agent_id):', actualSubject);
              }
            }
          }
        } catch (error) {
          console.error('Failed to resolve subject name:', error);
          actualSubject = 'General';
        }
      }

      console.log('Sending message with resolved subject:', actualSubject, 'for session:', session.id, 'agent_id:', session.agent_id);

      const response = await sendChatMessage({
        student_id: user.id,
        subject: actualSubject,
        class_name: userClass,
        query: content,
        session_id: session.id,
        language: 'auto',
      });

      console.log('API response structure:', response);

      // Handle quiz intent
      if (response.intent === 'quiz') {
        const quizData = response.evaluation?.quiz_data || response.response;
        const questions = quizData?.questions || [];

        const aiMessage: ChatMessage = {
          id: response.conversation_id || `ai-${Date.now()}`,
          session_id: session.id,
          conversation_id: response.conversation_id,
          role: 'assistant',
          content: quizData?.title || 'Quiz',
          message_type: 'quiz',
          metadata: {
            quiz: {
              title: quizData?.title,
              description: quizData?.description,
              questions,
              current_question_index: 0,
              user_answers: {},
            },
          },
          created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiMessage]);
      } else if (response.intent === 'notes') {
        const notesData = response.response;
        const content = notesData?.content || {};

        const aiMessage: ChatMessage = {
          id: response.conversation_id || `ai-${Date.now()}`,
          session_id: session.id,
          conversation_id: response.conversation_id,
          role: 'assistant',
          content: notesData?.title || 'Notes',
          message_type: 'notes',
          metadata: {
            notes: {
              title: notesData?.title,
              description: notesData?.description,
              format: notesData?.format,
              detail_level: notesData?.detail_level,
              sections: content?.sections || [],
              key_points: content?.key_points || [],
              definitions: content?.definitions || [],
              summary: content?.summary || '',
            },
          },
          created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiMessage]);
      } else if (response.intent === 'study_plan') {
        const studyPlanData = response.evaluation?.study_plan_data || {};
        const responseData = response.response || {};
        const topicDetails = responseData.topic_details || {};

        const schedule = studyPlanData.schedule?.length > 0
          ? studyPlanData.schedule
          : (responseData.plan || []).map((p: any) => ({
              day: p.day,
              focus: p.focus,
              tasks: p.tasks || [],
              duration_minutes: p.duration_minutes,
              resources: p.resources || [],
            }));

        const aiMessage: ChatMessage = {
          id: response.conversation_id || `ai-${Date.now()}`,
          session_id: session.id,
          conversation_id: response.conversation_id,
          role: 'assistant',
          content: topicDetails.title || studyPlanData.title || 'Study Plan',
          message_type: 'study_plan',
          metadata: {
            study_plan: {
              title: topicDetails.title || studyPlanData.title,
              description: topicDetails.description || studyPlanData.description,
              level: topicDetails.level || studyPlanData.level,
              duration_days: topicDetails.duration_days || studyPlanData.duration_days,
              schedule,
              milestones: studyPlanData.milestones || [],
              key_concepts: studyPlanData.key_concepts || responseData.subtopics || [],
              subtopics: studyPlanData.subtopics || [],
              summary: studyPlanData.summary || responseData.summary || '',
              full_plan: responseData.full_plan || '',
              study_plan: responseData.full_plan || '',
              subject: actualSubject,
            },
          },
          created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiMessage]);
      } else if (response.intent === 'study') {
        let responseContent = response.response;
        if (response.response && typeof response.response === 'object' && response.response.summary) {
          responseContent = response.response.summary;
        }

        const aiMessage: ChatMessage = {
          id: response.conversation_id || `ai-${Date.now()}`,
          session_id: session.id,
          conversation_id: response.conversation_id,
          role: 'assistant',
          content: responseContent,
          message_type: 'study',
          created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Handle different response structures
        let responseContent = response.response;

        // If response has nested structure with summary, use that
        if (response.response && typeof response.response === 'object' && response.response.summary) {
          responseContent = response.response.summary;
          console.log('Using nested summary response:', responseContent);
        } else if (response.response && typeof response.response === 'string') {
          responseContent = response.response;
          console.log('Using direct response:', responseContent);
        }

        const aiMessage: ChatMessage = {
          id: response.conversation_id || `ai-${Date.now()}`,
          session_id: session.id,
          conversation_id: response.conversation_id,
          role: "assistant",
          content: responseContent,
          message_type: "text",
          created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiMessage]);
      }

      setSessions(prev => prev.map(s =>
        s.id === session.id
          ? { ...s, last_message_at: new Date().toISOString(), message_count: s.message_count + 2 }
          : s
      ));

    } catch (error) {
      console.error("Failed to send message:", error);

      if (error.response?.status === 500) {
        toast.error("Server error. Please try again or contact support.");
      } else if (error.response?.status === 404) {
        toast.error("Service not available. Please try again later.");
      } else {
        toast.error("Failed to send message. Please try again.");
      }

      setMessages(prev => prev.filter(m => m.id !== `temp-${Date.now()}`));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    console.log('handleNewChat called with:', { agentType, agentName, agentId });
    console.log('Current session:', currentSession);
    console.log('Available sessions:', sessions);

    // Create a new chat session with the current subject
    if (agentType && agentName) {
      console.log('Creating new session with props agent');
      createSession(agentType, agentName, agentId);
      return;
    }

    if (currentSession?.agent_type && currentSession?.agent_name) {
      console.log('Creating new session with current session agent:', currentSession.agent_name);
      createSession(currentSession.agent_type, currentSession.agent_name, currentSession.agent_id);
      return;
    }

    if (currentSessionId) {
      // Find the current session from the sessions array
      let sessionFromList = sessions.find(s => s.id === currentSessionId);

      // If sessions aren't loaded yet or session not found, reload and try again
      if (!sessionFromList) {
        console.log('Session not in list, reloading sessions...');
        const freshSessions = await loadSessions();
        const freshSessionsArray = Array.isArray(freshSessions) ? freshSessions : sessions;
        sessionFromList = freshSessionsArray.find((s: any) => s.id === currentSessionId || s.chat_session_id === currentSessionId || s.session_id === currentSessionId);
      }

      if (sessionFromList?.agent_type && sessionFromList?.agent_name) {
        console.log('Creating new session with session from list:', sessionFromList.agent_name);
        createSession(sessionFromList.agent_type, sessionFromList.agent_name, sessionFromList.agent_id);
        return;
      }
    }

    // If no current subject, go to explore to choose one
    console.log('No current subject, navigating to explore');
    navigate("/student/explore");
  };

  const handleRenameSession = (sessionId: string, currentTitle: string) => {
    const newTitle = prompt("Enter new title:", currentTitle);
    if (newTitle && newTitle.trim() && newTitle !== currentTitle) {
      if (onRenameSession) {
        onRenameSession(sessionId, newTitle.trim());
      }
    }
  };

  const handleFeedback = async (messageId: string, feedback: 'like' | 'dislike') => {
    try {
      // Find the message to get its conversation_id
      const message = messages.find(m => m.id === messageId);
      if (!message || !message.conversation_id) {
        console.error("Message or conversation_id not found for messageId:", messageId);
        toast.error("Failed to submit feedback: Missing conversation ID");
        return;
      }

      const feedbackData = {
        student_id: user.id,
        conversation_id: message.conversation_id,
        feedback: feedback, // Send 'like' or 'dislike' instead of emojis
      };

      await updateMessageFeedback(feedbackData);

      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, feedback } : m
      ));

      toast.success("Feedback submitted");
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback");
    }
  };

  // Document functions (simplified for now)
  const handleDocumentPreviewClick = async () => {
    if (!isSplitViewOpen) {
      // Opening split view - load documents first
      await loadAgentDocuments();
      setIsSplitViewOpen(true);
    } else {
      // Closing split view
      handleCloseSplitView();
    }
  };

  const loadAgentDocuments = async () => {
    if (!user?.id) {
      setDocumentError("No user found");
      return;
    }

    // Get agent ID from multiple sources
    const sessionAgentId = currentSession?.agent_id;
    const propAgentId = agentId;
    let finalAgentId = sessionAgentId || propAgentId;

    console.log('Initial agent data:', {
      sessionAgentId,
      propAgentId,
      currentSession,
      agentId
    });

    // If agent ID is invalid (empty, undefined, appears to be a name, or is a constructed pattern), try to resolve it
    if (!finalAgentId ||
      !finalAgentId.startsWith('agent_') ||
      finalAgentId.includes(' ') ||
      finalAgentId === 'agent_ai tutor' ||
      // Check for constructed patterns like agent_resumescience (all lowercase after agent_)
      finalAgentId.match(/^agent_[a-z]+$/)) {

      console.log('Invalid or constructed agent ID detected, attempting resolution:', finalAgentId);

      // Try to get the actual agent ID from student subjects
      try {
        const studentSubjectsResponse = await getStudentAgent(user.id);
        console.log('Student subjects response:', studentSubjectsResponse);

        const allSubjects = [
          ...(studentSubjectsResponse.student_subjects || []),
          ...(studentSubjectsResponse.general_subjects || []),
        ];

        // If we have a current session with agent_name, try to find matching subject
        if (currentSession?.agent_name) {
          const matchingSubject = allSubjects.find((subject: any) =>
            subject.name?.toLowerCase() === currentSession.agent_name?.toLowerCase()
          );

          if (matchingSubject?.subject_agent_id) {
            finalAgentId = matchingSubject.subject_agent_id;
            console.log('Resolved agent ID from session agent name:', finalAgentId);

            // Update the current session with the found agent ID
            setCurrentSession(prev => prev ? { ...prev, agent_id: finalAgentId } : null);
          }
        }

        // If still no valid ID, try to use the first available subject
        if (!finalAgentId || !finalAgentId.startsWith('agent_')) {
          if (allSubjects.length > 0 && allSubjects[0].subject_agent_id) {
            finalAgentId = allSubjects[0].subject_agent_id;
            console.log('Using first available subject agent ID:', finalAgentId);
          }
        }

      } catch (error) {
        console.error('Failed to resolve agent ID:', error);
        setDocumentError("Failed to resolve agent for documents");
        return;
      }
    }

    // Final validation
    if (!finalAgentId || !finalAgentId.startsWith('agent_')) {
      console.error('No valid agent ID could be resolved. Final value:', finalAgentId);
      setDocumentError("No valid agent selected - please select a subject first");
      return;
    }

    try {
      setIsLoadingDocuments(true);
      setDocumentError(null);

      console.log('Making API call to get documents for agent:', finalAgentId);
      const response = await getStudentAgentDocuments(user.id, finalAgentId);
      console.log('Documents API response:', response);

      // Handle the API response format - it returns document IDs
      const documentIds = response.documents || response.document_ids || response.doc_unique_ids || response || [];
      console.log('Document IDs extracted:', documentIds);

      if (!Array.isArray(documentIds) || documentIds.length === 0) {
        console.log('No documents found for agent:', finalAgentId);
        setAgentDocuments([]);
        return;
      }

      // Convert document IDs to AgentDocument format
      const documents: AgentDocument[] = documentIds.map((docId: string) => ({
        id: docId,
        name: `Document ${docId}`,
        title: `Document ${docId}`,
        file_name: `document_${docId}`,
        agent_id: finalAgentId,
        agent_name: currentSession?.agent_name || 'Unknown Agent'
      }));

      console.log('Documents converted to AgentDocument format:', documents);
      setAgentDocuments(documents);
    } catch (error) {
      console.error("Failed to load agent documents:", error);
      setDocumentError("Failed to load documents");
      toast.error("Failed to load agent documents");
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleDocumentSelect = async (document: AgentDocument) => {
    if (!user?.id) return;

    // Get agent ID from multiple sources
    const sessionAgentId = currentSession?.agent_id;
    const propAgentId = agentId;
    let finalAgentId = sessionAgentId || propAgentId;

    // If agent ID is invalid, try to resolve it using the same logic as loadAgentDocuments
    if (!finalAgentId ||
      !finalAgentId.startsWith('agent_') ||
      finalAgentId.includes(' ') ||
      finalAgentId === 'agent_ai tutor') {

      try {
        const studentSubjectsResponse = await getStudentAgent(user.id);
        const allSubjects = [
          ...(studentSubjectsResponse.student_subjects || []),
          ...(studentSubjectsResponse.general_subjects || []),
        ];

        // If we have a current session with agent_name, try to find matching subject
        if (currentSession?.agent_name) {
          const matchingSubject = allSubjects.find((subject: any) =>
            subject.name?.toLowerCase() === currentSession.agent_name?.toLowerCase()
          );

          if (matchingSubject?.subject_agent_id) {
            finalAgentId = matchingSubject.subject_agent_id;
          }
        }

        // If still no valid ID, try to use the first available subject
        if (!finalAgentId || !finalAgentId.startsWith('agent_')) {
          if (allSubjects.length > 0 && allSubjects[0].subject_agent_id) {
            finalAgentId = allSubjects[0].subject_agent_id;
          }
        }

      } catch (error) {
        console.error('Document preview: failed to resolve agent ID:', error);
        toast.error("Failed to resolve agent for document preview");
        return;
      }
    }

    // Final validation
    if (!finalAgentId || !finalAgentId.startsWith('agent_')) {
      toast.error("No valid agent selected for document preview");
      return;
    }

    try {
      setIsLoadingPreview(true);
      setDocumentError(null);

      const response = await previewDocument(user.id, finalAgentId, document.id);

      // Debug: Check the actual response structure
      let content = '';
      let contentType: 'text' | 'pdf' | 'binary' | 'markdown' | 'html' = 'text';

      if (typeof response === 'string') {
        if (response.startsWith('%PDF')) {
          // This is actual PDF binary data - we can't display it directly
          content = 'PDF binary data - download to view';
          contentType = 'pdf';
        } else if (response.includes('0x') || response.includes('\u0000')) {
          // Binary data detected
          content = 'Binary content - download to view';
          contentType = 'binary';
        } else {
          content = response;
          contentType = 'text';
        }
      } else if (typeof response === 'object' && response !== null) {
        content = response.content || response.preview || response.data || response.text || JSON.stringify(response);
        const responseContentType = response.content_type || response.type || 'text';

        if (responseContentType === 'pdf' || responseContentType === 'application/pdf') {
          contentType = 'pdf';
        } else if (responseContentType === 'binary') {
          contentType = 'binary';
        } else if (responseContentType === 'markdown') {
          contentType = 'markdown';
        } else if (responseContentType === 'html') {
          contentType = 'html';
        } else {
          contentType = 'text';
        }

        // Check if content is actually binary data
        if (content && typeof content === 'string' && (content.includes('0x') || content.includes('\u0000'))) {
          content = 'Binary content - download to view';
          contentType = 'binary';
        }
      } else {
        content = '[No content available]';
        contentType = 'text';
      }

      const documentPreview: DocumentPreview = {
        id: document.id,
        content: content,
        content_type: contentType,
        pages: response.pages || document.pages,
        total_pages: response.total_pages || document.pages,
        metadata: {
          ...document,
          created_at: document.upload_date,
          preview_available: true,
          download_url: `${BASE_URL}${VERSION}/student/${user.id}/agents/${finalAgentId}/documents/${document.id}/preview`
        },
      };

      setSelectedDocument(documentPreview);
      setCurrentDocumentIndex(agentDocuments.findIndex(doc => doc.id === document.id));
    } catch (error) {
      console.error("Failed to preview document:", error);
      setDocumentError("Failed to preview document");
      toast.error("Failed to preview document");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleNextDocument = () => {
    if (currentDocumentIndex < agentDocuments.length - 1) {
      const nextDoc = agentDocuments[currentDocumentIndex + 1];
      handleDocumentSelect(nextDoc);
    }
  };

  const handlePreviousDocument = () => {
    if (currentDocumentIndex > 0) {
      const prevDoc = agentDocuments[currentDocumentIndex - 1];
      handleDocumentSelect(prevDoc);
    }
  };

  const handleCloseSplitView = () => {
    setIsSplitViewOpen(false);
    setSelectedDocument(null);
    setCurrentDocumentIndex(0);
  };

  const handleTextAction = (action: 'explain' | 'summarize', text: string, documentId: string) => {
    console.log('handleTextAction called:', { action, text, documentId });

    // Get agent info from current session instead of props
    const currentAgentName = currentSession?.agent_name || agentName;
    const currentAgentId = currentSession?.agent_id || agentId;

    if (!user?.id || !currentAgentName || !currentAgentId) {
      console.log('Missing required data:', { user: !!user, currentAgentName, currentAgentId });
      return;
    }

    // Create query with action keyword and selected text
    const query = `${action} ${text}`;
    console.log('Created query:', query);

    // Set the query in the chat input box
    console.log('Setting external input value:', query);
    setExternalInputValue(query);
  };

  const handleExternalInputClear = () => {
    setExternalInputValue(undefined);
  };

  const handleUpdateMessage = (messageId: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, ...updates } : m));
  };

  const chatContextValue: ChatContextType = {
    sessions,
    currentSession,
    messages,
    isLoading,
    createSession,
    switchSession,
    sendMessage,
    deleteSession: async (id) => { },
    renameSession: async (id, title) => { },
    archiveSession: async (id) => { },
    loadSessions,
    loadMessages: switchSession,
  };

  // Render different content based on viewType
  if (viewType === 'dashboard') {
    return (
      <div className="dashboard-page-padding flex-1 space-y-6">
        <div className="hero-card overflow-hidden">
          <div className="relative grid gap-8 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)] lg:items-center">
            <div className="absolute inset-y-8 right-8 hidden w-32 rounded-full bg-accent/15 blur-3xl lg:block" />
            <div className="absolute left-10 top-10 h-20 w-20 rounded-full border border-white/40 bg-white/20 blur-2xl" />

            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary shadow-sm shadow-primary/10">
                <Sparkles className="h-3.5 w-3.5" />
                Learning cockpit
              </div>

              <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-[-0.03em] text-slate-950 sm:text-4xl lg:text-5xl">
                AI learning space jo first look mein hi premium feel de.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Personalized tutors, focused practice, aur instant explanations ko ek polished workspace mein combine kiya gaya hai so every session feels intentional and high-end.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={handleNewChat} size="lg" className="gap-2 rounded-full px-6 shadow-glow">
                  <Plus className="h-4 w-4" />
                  Start Learning
                </Button>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm text-slate-600 shadow-sm backdrop-blur">
                  <Bot className="h-4 w-4 text-primary" />
                  Smart tutors ready for deep-dive sessions
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <div className="rounded-[28px] border border-white/75 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-300/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/55">Session preview</p>
                    <h2 className="mt-2 text-xl font-semibold">Momentum board</h2>
                  </div>
                  <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/70">
                    Live
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {showcaseMetrics.map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                          <Icon className="h-4 w-4 text-cyan-300" />
                        </div>
                        <span className="text-sm text-white/72">{label}</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-400/10 via-sky-400/10 to-emerald-400/10 p-4">
                  <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">Ready state</p>
                  <p className="mt-2 text-sm leading-6 text-white/78">
                    Pick a subject, jump into chat, and use documents side-by-side for a focused study sprint.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Recent activity</p>
              <h2 className="mt-2 text-xl font-bold tracking-[-0.02em] text-slate-950">Continue where your flow left off</h2>
            </div>
            <div className="rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm text-slate-600 shadow-sm">
              {sessions.length} conversation{sessions.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {sessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className="group hover-lift cursor-pointer overflow-hidden rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-xl transition-all hover:border-primary/35 hover:bg-white"
                onClick={() => switchSession(session.id)}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 ring-1 ring-primary/15">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1 text-xs text-slate-500 transition-colors group-hover:border-primary/20 group-hover:text-primary">
                    {session.message_count} messages
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="line-clamp-2 text-base font-semibold tracking-[-0.02em] text-slate-950">
                      {session.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{session.agent_name}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Quick resume</p>
                    <p className="mt-2 text-sm text-white/78">
                      Continue your tutor thread and keep the learning context intact.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (viewType === 'explore') {
    return (
      <div className="dashboard-page-padding flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="hero-card mb-6 overflow-hidden">
            <div className="relative grid gap-6 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1.15fr)_280px] lg:items-center">
              <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative z-10">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">Tutor library</p>
                <h1 className="max-w-2xl text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
                  Explore subjects with a sharper, more editorial learning vibe.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                  Open a focused AI tutor workspace built for quick practice, crystal-clear explanations, and revision sessions that feel structured instead of generic.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {learningHighlights.map((item) => (
                    <div
                      key={item}
                      className="rounded-full border border-white/75 bg-white/75 px-4 py-2 text-sm text-slate-600 shadow-sm"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Why this works</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-slate-900">Subject-first discovery</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">Jump into the exact tutor you need without scrolling through clutter.</p>
                  </div>
                  <div className="rounded-2xl border border-accent/10 bg-accent/5 p-4">
                    <p className="text-sm font-semibold text-slate-900">Built for momentum</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">From topic preview to chat launch, the whole flow keeps you moving.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (viewType === 'chat') {
    return (
      <ChatContext.Provider value={chatContextValue}>
        <div className="flex-1 flex flex-row min-w-0 h-full overflow-hidden">
          {/* Split Document View - Left Half */}
          {isSplitViewOpen && (
            <SplitDocumentView
              document={selectedDocument}
              documents={agentDocuments}
              isLoading={isLoadingDocuments || isLoadingPreview}
              error={documentError}
              onClose={handleCloseSplitView}
              onDocumentSelect={handleDocumentSelect}
              onPreviousDocument={handlePreviousDocument}
              onNextDocument={handleNextDocument}
              hasNextDocument={currentDocumentIndex < agentDocuments.length - 1}
              hasPreviousDocument={currentDocumentIndex > 0}
              currentDocumentIndex={currentDocumentIndex}
              onTextAction={handleTextAction}
            />
          )}

          {/* Chat Interface - Right Half */}
          <div className={cn(
            "flex flex-col min-w-0 h-full overflow-hidden",
            isSplitViewOpen ? "w-1/2" : "w-full"
          )}>
            <div className="relative flex-shrink-0 px-3 py-2 sm:px-4 sm:py-2.5">
              <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-primary/10 via-accent/5 to-transparent blur-2xl pointer-events-none" />
              <div className="relative flex items-center justify-between z-10">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  {onBack && (
                    <Button variant="ghost" size="icon-sm" onClick={onBack}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}

                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 text-primary ring-1 ring-primary/10">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="mb-0.5 inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                        <Sparkles className="h-3 w-3" />
                        Tutor mode
                      </div>
                      <h1 className="truncate text-sm font-semibold tracking-[-0.02em]">
                        {currentSession?.title || (agentName ? `${agentName} Chat` : "AI Chat")}
                        {isSplitViewOpen && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (Split View)
                          </span>
                        )}
                      </h1>
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  <DocumentPreviewButton
                    agentId={currentSession?.agent_id}
                    agentName={currentSession?.agent_name}
                    documentCount={agentDocuments.length}
                    isLoading={isLoadingDocuments}
                    onClick={handleDocumentPreviewClick}
                    isSplitViewOpen={isSplitViewOpen}
                  />

                  <TopicsDropdown
                    agentId={currentSession?.agent_id || agentId}
                    agentName={currentSession?.agent_name || agentName}
                  />

                  {!isSplitViewOpen && (
                    <Button
                      onClick={handleNewChat}
                      variant="outline"
                      size="sm"
                      className="gap-2 whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      New Chat
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
              <ChatWindow
                messages={messages}
                isLoading={isLoading}
                onSendMessage={sendMessage}
                onFeedback={handleFeedback}
                onUpdateMessage={handleUpdateMessage}
                placeholder={currentSession ? `Ask anything about ${currentSession.agent_name}...` : "Type your message..."}
                agentId={currentSession?.agent_id || agentId}
                agentName={currentSession?.agent_name || agentName}
                externalInputValue={externalInputValue}
                onExternalInputClear={handleExternalInputClear}
                studentId={user?.id}
                subject={currentSession?.agent_name || agentName || "General"}
              />
            </div>
          </div>
        </div>

        {/* Document Modals - DISABLED to prevent popups */}
        {/* All document viewing now happens in split-screen view */}
      </ChatContext.Provider>
    );
  }

  return <div>Unknown view type</div>;
}
