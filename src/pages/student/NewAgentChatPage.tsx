import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import AdaptiveContent from "@/components/layout/AdaptiveContent";
import { useAuth } from "@/contexts/AuthContext";
import { createChatSession, getChatSessions } from "@/config/services";
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

  // Check for existing sessions and navigate to last one, or create new if none exist
  useEffect(() => {
    const handleSessionNavigation = async () => {
      if (!agentInfo || !user?.id || isLoading) return;

      try {
        // First, try to get existing sessions for this user
        const sessionsResponse = await getChatSessions(user.id);
        
        const sessionsData = sessionsResponse.sessions || sessionsResponse.chat_sessions || sessionsResponse || [];

        // Find most recently updated session FOR THIS SPECIFIC AGENT
        const agentSessions = sessionsData.filter((session: any) => {
          // Match by agent_id if available, otherwise match by agent_name
          if (session.agent_id && session.agent_id === agentInfo.agentId) {
            return true;
          }
          // Fallback to name matching if agent_id is not reliable
          const sessionAgentName = session.agent_name || session.title?.match(/New (\w+) Chat/)?.[1];
          
          if (sessionAgentName?.toLowerCase() === agentInfo.agentName.toLowerCase()) {
            return true;
          }
          
          return false;
        });

        console.log("Filtered sessions for agent:", agentInfo.agentName, agentSessions);

        const mostRecentSession = agentSessions.sort((a: any, b: any) => {
          // Use updated_at first, then last_message_at, then created_at as fallback
          const dateA = new Date(a.updated_at || a.last_message_at || a.created_at || 0);
          const dateB = new Date(b.updated_at || b.last_message_at || b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        })[0];

        console.log("Most recent session found:", mostRecentSession);

        if (mostRecentSession) {
          const sessionId = mostRecentSession.chat_session_id || mostRecentSession.id;
          
          // Check if the existing session has an incorrect agent ID (constructed pattern)
          const hasIncorrectAgentId = mostRecentSession.agent_id?.match(/^agent_[a-z]+$/);
          
          if (hasIncorrectAgentId && mostRecentSession.agent_id !== agentInfo.agentId) {
            console.log('Detected incorrect agent ID in session, will be resolved dynamically:', {
              sessionId,
              oldAgentId: mostRecentSession.agent_id,
              newAgentId: agentInfo.agentId
            });
            // Note: Backend doesn't support updating agent_id in existing sessions
            // The frontend components will resolve the correct agent ID dynamically
          }
          
          console.log("Navigating to most recent session:", sessionId, "Updated at:", mostRecentSession.updated_at);
          
          // Navigate to most recent session
          navigate(`/student/chat/session/${sessionId}`, { replace: true });
          toast.success(`Opened ${agentInfo.agentName} chat session`);
        } else {
          // No existing sessions for this agent, create a new one
          const sessionData = {
            student_id: user.id,
            title: `New ${agentInfo.agentName} Chat`,
            agent_type: agentInfo.agentType,
            agent_name: agentInfo.agentName,
            agent_id: agentInfo.agentId,
          };

          console.log("No existing sessions found, creating new session with data:", sessionData);
          const response = await createChatSession(sessionData);
          console.log("Session creation response:", response);

          if (response?.chat_session_id) {
            // Navigate to the newly created session
            navigate(`/student/chat/session/${response.chat_session_id}`, { replace: true });
            toast.success(`${agentInfo.agentName} chat session created`);
          } else {
            console.error("Invalid session response:", response);
            toast.error("Failed to create chat session");
            // Fallback to chat list
            navigate("/student/chat", { replace: true });
          }
        }
      } catch (error) {
        console.error("Failed to handle session navigation:", error);
        toast.error("Failed to load chat sessions");
        // Fallback to chat list
        navigate("/student/chat", { replace: true });
      }
    };

    handleSessionNavigation();
  }, [agentInfo, user?.id, navigate, isLoading]);

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
          <h2 className="text-xl font-semibold mb-2">Opening {agentInfo.agentName} Chat</h2>
          <p className="text-muted-foreground">Checking for existing sessions...</p>
        </div>
      </div>
    </UnifiedLayout>
  );
}
