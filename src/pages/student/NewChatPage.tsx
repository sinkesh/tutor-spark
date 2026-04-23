import { useNavigate } from "react-router-dom";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import AdaptiveContent from "@/components/layout/AdaptiveContent";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewChatPage() {
  const navigate = useNavigate();

  const handleNewChat = () => {
    console.log('New chat requested');
  };

  return (
    <UnifiedLayout
      title="AI Chat"
      showBackButton={true}
      viewType="chat"
      onNewChat={handleNewChat}
    >
      <AdaptiveContent
        viewType="chat"
        onNewChat={handleNewChat}
        onBack={() => navigate('/student')}
      />
    </UnifiedLayout>
  );
}
