import { useEffect, useState } from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import AdaptiveContent from "@/components/layout/AdaptiveContent";
import { getStudentAgent } from "@/config/services";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function ExplorePage() {
  const { user } = useAuth();

  const handleNewChat = () => {
    console.log('New chat requested');
  };

  return (
    <UnifiedLayout
      title="Explore"
      showBackButton={false}
      viewType="explore"
      onNewChat={handleNewChat}
    >
      <AdaptiveContent
        viewType="explore"
        onNewChat={handleNewChat}
      />
    </UnifiedLayout>
  );
}
