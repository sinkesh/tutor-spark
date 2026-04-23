import UnifiedLayout from "@/components/layout/UnifiedLayout";
import AdaptiveContent from "@/components/layout/AdaptiveContent";

export default function DashboardPage() {
  const handleNewChat = () => {
    console.log('New chat requested');
  };

  return (
    <UnifiedLayout
      title="Dashboard"
      showBackButton={false}
      viewType="dashboard"
      onNewChat={handleNewChat}
    >
      <AdaptiveContent
        viewType="dashboard"
        onNewChat={handleNewChat}
      />
    </UnifiedLayout>
  );
}
