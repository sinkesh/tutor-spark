import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import AdaptiveContent from "@/components/layout/AdaptiveContent";
import { useAuth } from "@/contexts/AuthContext";
import { resolveAgentId } from "@/config/services";
import { toast } from "sonner";

export default function NewAgentChatPage() {
  const { subjectName } = useParams<{ subjectName: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agentInfo, setAgentInfo] = useState<{ agentType: string; agentName: string; agentId: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resolveAgentInfo = async () => {
      if (!subjectName) {
        setIsLoading(false);
        return;
      }

      try {
        const agentId = await resolveAgentId(subjectName, user?.id);

        if (agentId) {
          setAgentInfo({
            agentId,
            agentName: subjectName,
            agentType: 'subject'
          });
        } else {
          const fallbackId = `agent_${subjectName.toLowerCase().replace(/\s+/g, '_')}`;
          setAgentInfo({
            agentId: fallbackId,
            agentName: subjectName,
            agentType: 'subject'
          });
          toast.warning('Using default agent configuration');
        }
      } catch (error) {
        console.error('Failed to resolve agent:', error);
        const fallbackId = `agent_${subjectName.toLowerCase().replace(/\s+/g, '_')}`;
        setAgentInfo({
          agentId: fallbackId,
          agentName: subjectName,
          agentType: 'subject'
        });
      }

      setIsLoading(false);
    };

    resolveAgentInfo();
  }, [subjectName, user?.id]);

  const handleNewChat = () => {
    console.log('New chat requested');
    navigate("/student/chat");
  };

  if (isLoading || !agentInfo) {
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

  return (
    <UnifiedLayout
      title={`${agentInfo.agentName} Chat`}
      showBackButton={true}
      viewType="chat"
      onNewChat={handleNewChat}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0 overflow-hidden">
          <AdaptiveContent
            viewType="chat"
            agentType={agentInfo.agentType}
            agentName={agentInfo.agentName}
            agentId={agentInfo.agentId}
          />
        </div>
      </div>
    </UnifiedLayout>
  );
}
