import { useParams, useNavigate } from "react-router-dom";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import AdaptiveContent from "@/components/layout/AdaptiveContent";
import { ChatSession } from "@/types/chat";
import { appRoutes } from "@/config/routes";

export default function ChatSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const handleSessionSelect = (session: ChatSession) => {
    console.log('Session selected:', session);
    // Navigate to the selected session to load its history
    navigate(appRoutes.student.chatSession(session.id));
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
