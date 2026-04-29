import { useParams, useNavigate } from "react-router-dom";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import AdaptiveContent from "@/components/layout/AdaptiveContent";
import { ChatSession } from "@/types/chat";
import { toast } from "sonner";

export default function ChatSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const handleSessionSelect = (session: ChatSession) => {
    console.log('Session selected:', session);

    // Defensive: ensure session has a valid ID
    if (!session?.id) {
      console.error('Cannot select session without ID:', session);
      toast.error('Invalid session selected');
      return;
    }

    // Navigate to the selected session to load its history
    navigate(`/student/chat/session/${session.id}`);
  };

  const handleRenameSession = (sessionId: string, currentTitle: string) => {
    const newTitle = prompt("Enter new title:", currentTitle);
    if (newTitle && newTitle.trim() && newTitle !== currentTitle) {
      // TODO: Implement rename functionality
      console.log('Rename session:', sessionId, 'from:', currentTitle, 'to:', newTitle);
    }
  };

  return (
    <UnifiedLayout
      title="AI Chat"
      showBackButton={true}
      currentSessionId={sessionId}
      onSessionSelect={handleSessionSelect}
      onRenameSession={handleRenameSession}
      viewType="chat"
    >
      <AdaptiveContent
        viewType="chat"
        currentSessionId={sessionId}
        onSessionSelect={handleSessionSelect}
        onRenameSession={handleRenameSession}
      />
    </UnifiedLayout>
  );
}
