import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { extractTopicsFromAgent } from "@/config/services";
import { toast } from "sonner";
import { Loader2, BookOpen, ChevronDown, ChevronUp, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface Topic {
  topic: string;
  description: string;
  confidence?: number;
  subtopics?: Subtopic[];
}

interface Subtopic {
  subtopic: string;
  description: string;
  confidence?: number;
}

interface TopicsCardProps {
  agentId: string;
  agentName: string;
}

export default function TopicsCard({ agentId, agentName }: TopicsCardProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log('TopicsCard - agentId:', agentId, 'agentName:', agentName);
    // Only load topics if we have a valid agent ID
    // Valid agent IDs should either start with 'agent_' followed by actual ID (like agent_A5DED)
    // or be non-empty strings that don't look like constructed patterns
    if (agentId && agentId.trim() !== '') {
      // Check if it's a constructed pattern like agent_resumescience (invalid)
      // vs a real agent ID like agent_A5DED (valid)
      const looksLikeConstructedPattern = agentId.match(/^agent_[a-z]+$/);
      if (!looksLikeConstructedPattern) {
        loadTopics();
      } else {
        console.log('TopicsCard - Skipping constructed agent ID pattern:', agentId);
      }
    } else {
      console.log('TopicsCard - No agentId provided, skipping topics loading');
    }
  }, [agentId]);

  const loadTopics = async () => {
    if (!agentId) return;
    
    try {
      setIsLoading(true);
      const response = await extractTopicsFromAgent(agentId);
      console.log('Topics response:', response);
      
      // Handle different response formats
      const topicsData = response.topics || response.data || response || [];
      setTopics(Array.isArray(topicsData) ? topicsData : []);
    } catch (error: any) {
      console.error("Failed to load topics:", error);
      
      // Handle 404 errors gracefully - this means the agent doesn't exist
      if (error.response?.status === 404) {
        console.log(`Agent ${agentId} not found - this might be a constructed agent ID`);
        toast.info(`Topics not available for ${agentName}`);
      } else {
        toast.error("Failed to load topics");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTopicExpansion = (topicTitle: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicTitle)) {
        newSet.delete(topicTitle);
      } else {
        newSet.add(topicTitle);
      }
      return newSet;
    });
  };


  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-muted-foreground">Loading topics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topics.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5" />
          {agentName} Topics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ScrollArea className="h-80 w-full">
          <div className="space-y-3 pr-4">
            {topics.map((topic, index) => (
              <Card key={index} className="border-l-4 border-l-primary/50 bg-muted/30">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Hash className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold text-sm">{topic.topic}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {topic.description}
                        </p>
                      </div>
                      {topic.subtopics && topic.subtopics.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTopicExpansion(topic.topic)}
                          className="ml-2 h-8 w-8 p-0"
                        >
                          {expandedTopics.has(topic.topic) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {topic.subtopics && topic.subtopics.length > 0 && expandedTopics.has(topic.topic) && (
                      <div className="mt-3 space-y-2">
                        <Separator />
                        <div className="space-y-2">
                          {topic.subtopics.map((subtopic, subIndex) => (
                            <div key={subIndex} className="ml-4 p-3 bg-background/50 rounded-lg border">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">
                                  Subtopic
                                </Badge>
                                <h5 className="font-medium text-xs">{subtopic.subtopic}</h5>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {subtopic.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        
      </CardContent>
    </Card>
  );
}
