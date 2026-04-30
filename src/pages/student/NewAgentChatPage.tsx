import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import AdaptiveContent from "@/components/layout/AdaptiveContent";
import { useAuth } from "@/contexts/AuthContext";
import { resolveAgentId, getAgentTopics } from "@/config/services";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight, Sparkles } from "lucide-react";

interface Subtopic {
  subtopic: string;
  description: string;
  confidence: number;
}

interface Topic {
  topic: string;
  description: string;
  confidence: number;
  subtopics: Subtopic[];
}

interface TopicsResponse {
  status: string;
  subject_agent_id: string;
  topics: Topic[];
  total_chunks_analyzed: number;
}

export default function NewAgentChatPage() {
  const { subjectName } = useParams<{ subjectName: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agentInfo, setAgentInfo] = useState<{ agentType: string; agentName: string; agentId: string } | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve agent info when component mounts - only subjects and topics APIs
  // NO session creation here - session is created when first message is sent
  useEffect(() => {
    const resolveAgentInfo = async () => {
      if (!subjectName) {
        setIsLoading(false);
        return;
      }

      try {
        // Resolve agent ID (subjects API)
        const agentId = await resolveAgentId(subjectName, user?.id);

        if (agentId) {
          // Also fetch topics for this agent (topics API)
          let topicsData: Topic[] = [];
          try {
            const response = await getAgentTopics(agentId) as TopicsResponse;
            if (response?.topics && Array.isArray(response.topics)) {
              topicsData = response.topics;
              setTopics(topicsData);
            }
          } catch (e) {
            // Topics fetch is optional
            console.log('Topics fetch skipped or failed:', e);
          }

          setAgentInfo({
            agentId,
            agentName: subjectName,
            agentType: 'subject'
          });
        } else {
          // Create fallback agent
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
        // Create fallback agent
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

  // Render the chat interface with topics cards
  return (
    <UnifiedLayout
      title={`${agentInfo.agentName} Chat`}
      showBackButton={true}
      viewType="chat"
      onNewChat={handleNewChat}
    >
      <div className="flex flex-col h-full">
        {/* Topics Section - Card View - Fixed height, not scrollable */}
        {topics.length > 0 && (
          <div className="flex-shrink-0 border-b border-border bg-gradient-to-br from-violet-50/50 via-fuchsia-50/30 to-sky-50/50 dark:from-violet-950/20 dark:via-fuchsia-950/10 dark:to-sky-950/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-fuchsia-500" />
              <h2 className="text-lg font-semibold bg-gradient-to-r from-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
                Topics for {agentInfo.agentName}
              </h2>
              <Badge variant="secondary" className="ml-auto">
                {topics.length} topics
              </Badge>
            </div>

            {/* Horizontal scrollable topics */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-fuchsia-200 scrollbar-track-transparent">
              {topics.map((topic, index) => (
                <Card
                  key={index}
                  className="group cursor-pointer flex-shrink-0 w-[400px] border-white/60 bg-white/70 backdrop-blur-sm hover:border-fuchsia-300 hover:shadow-lg hover:shadow-fuchsia-200/30 dark:border-white/10 dark:bg-white/5 dark:hover:border-fuchsia-500/50 transition-all duration-300"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold text-foreground group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-fuchsia-500 flex-shrink-0" />
                        <span className="line-clamp-1">{topic.topic}</span>
                      </CardTitle>
                      <Badge
                        variant={topic.confidence >= 0.9 ? "default" : "secondary"}
                        className={`text-[10px] flex-shrink-0 ${topic.confidence >= 0.9 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : ''}`}
                      >
                        {(topic.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {topic.description}
                    </p>

                    {/* Subtopics preview */}
                    {topic.subtopics && topic.subtopics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {topic.subtopics.slice(0, 2).map((sub, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-[9px] px-1.5 py-0.5 border-fuchsia-200/60 bg-fuchsia-50/50 text-fuchsia-700 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300"
                          >
                            {sub.subtopic.length > 20 ? sub.subtopic.substring(0, 20) + '...' : sub.subtopic}
                          </Badge>
                        ))}
                        {topic.subtopics.length > 2 && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0.5">
                            +{topic.subtopics.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Chat Interface - Full remaining height */}
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
