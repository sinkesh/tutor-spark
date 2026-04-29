import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import AdaptiveContent from "@/components/layout/AdaptiveContent";
import { useAuth } from "@/contexts/AuthContext";
import { createChatSession } from "@/config/services";
import { useAgentCache } from "@/hooks/useAgentCache";
import { AgentResolutionError, handleAgentResolutionError, createFallbackAgent, validateAgentInfo, logAgentResolution } from "@/utils/agentUtils";
import { toast } from "sonner";

export default function NewAgentChatPage() {
  const { subjectName } = useParams<{ subjectName: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agentInfo, setAgentInfo] = useState<{ agentType: string; agentName: string; agentId: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { resolveAndCacheAgent, isLoading: cacheLoading } = useAgentCache();
  const hasCreatedSession = useRef(false);

  // Resolve agent info when component mounts
  useEffect(() => {
    const resolveAgentInfo = async () => {
      if (!subjectName) {
        setIsLoading(false);
        return;
      }

      logAgentResolution('START', { subjectName, userId: user?.id });
      
      try {
        // Always try dynamic resolution with caching first
        logAgentResolution('DYNAMIC_RESOLUTION_ATTEMPT', { subjectName });
        const resolvedAgentInfo = await resolveAndCacheAgent(subjectName, user?.id);
        
        if (resolvedAgentInfo) {
          validateAgentInfo(resolvedAgentInfo);
          logAgentResolution('DYNAMIC_RESOLUTION_SUCCESS', { subjectName, agentId: resolvedAgentInfo.agentId });
          setAgentInfo(resolvedAgentInfo);
        } else {
          throw new AgentResolutionError(
            'No agent found',
            'AGENT_NOT_FOUND',
            { subjectName }
          );
        }
      } catch (error) {
        logAgentResolution('DYNAMIC_RESOLUTION_FAILED', { subjectName, error: error.message });
        
        // Handle specific error types
        if (error instanceof AgentResolutionError) {
          handleAgentResolutionError(error, subjectName);
        } else {
          handleAgentResolutionError(error, subjectName);
        }
        
        // Create fallback agent as last resort
        const fallbackAgent = createFallbackAgent(subjectName);
        logAgentResolution('FALLBACK_CREATED', { subjectName, agentId: fallbackAgent.agentId });
        
        if (fallbackAgent) {
          setAgentInfo(fallbackAgent);
          toast.warning('Using default agent configuration - some features may not work correctly');
        } else {
          logAgentResolution('COMPLETE_FAILURE', { subjectName });
          toast.error(`No agent found for subject: ${subjectName}`);
        }
      }
      
      setIsLoading(false);
    };

    resolveAgentInfo();
  }, [subjectName, user?.id, resolveAndCacheAgent]);

  // Create new chat session directly when agent info is resolved
  // This page is only accessed when starting a NEW chat, so we always create a fresh session
  useEffect(() => {
    const createNewSession = async () => {
      // Prevent double-creation in React StrictMode
      if (hasCreatedSession.current) {
        console.log("Session already created, skipping...");
        return;
      }

      if (!agentInfo || !user?.id || isLoading) return;

      try {
        // Debug: Log user object to see if class is populated
        console.log("User object:", user);
        console.log("User class:", user.class);

        // Create a new session with the selected agent info
        const sessionData = {
          student_id: user.id,
          subject: subjectName || agentInfo.agentName,
          class_name: user.class || "", // Ensure class is at least an empty string
          title: `New ${agentInfo.agentName} Chat`,
          session_name: `${agentInfo.agentName} Session`,
          agent_type: agentInfo.agentType,
          agent_name: agentInfo.agentName,
          agent_id: agentInfo.agentId,
        };

        console.log("Creating new chat session with data:", sessionData);
        const response = await createChatSession(sessionData);
        console.log("Session creation response:", response);

        // Defensive: ensure response exists and has valid session ID
        const newSessionId = response?.chat_session_id || response?.id;
        if (newSessionId && typeof newSessionId === 'string' && newSessionId.length > 0) {
          console.log("Navigating to new session:", newSessionId);
          // Mark as created before navigating
          hasCreatedSession.current = true;
          // Navigate to the newly created session
          navigate(`/student/chat/session/${newSessionId}`, { replace: true });
          toast.success(`${agentInfo.agentName} chat session created`);
        } else {
          console.error("Invalid session response - no session ID:", response);
          toast.error("Failed to create chat session - invalid response");
          // Fallback to chat list
          navigate("/student/chat", { replace: true });
        }
      } catch (error) {
        console.error("Failed to create chat session:", error);
        toast.error("Failed to create chat session");
        // Fallback to chat list
        navigate("/student/chat", { replace: true });
      }
    };

    createNewSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentInfo?.agentId, user?.id, subjectName]);

  const handleNewChat = () => {
    console.log('New chat requested');
    navigate("/student/chat");
  };

  if (isLoading || cacheLoading || !agentInfo) {
    return (
      <UnifiedLayout
        title="AI Chat"
        showBackButton={true}
        viewType="chat"
        onNewChat={handleNewChat}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              🤖
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {isLoading ? "Loading Agent Info..." : "Agent Not Found"}
            </h2>
            <p className="text-muted-foreground">
              {isLoading ? "Finding the right AI agent for you..." : "The requested AI agent could not be found."}
            </p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  // Show loading state while checking sessions
  return (
    <UnifiedLayout
      title={`${agentInfo.agentName} Chat`}
      showBackButton={true}
      viewType="chat"
      onNewChat={handleNewChat}
    >
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            🤖
          </div>
          <h2 className="text-xl font-semibold mb-2">Creating {agentInfo.agentName} Chat</h2>
          <p className="text-muted-foreground">Starting a new chat session...</p>
        </div>
      </div>
    </UnifiedLayout>
  );
}
