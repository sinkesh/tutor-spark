import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Topic, Subtopic, StudentSubject } from "@/types/chat";
import { getStudentAgent, extractTopicsFromAgent } from "@/config/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, BookOpen, ChevronDown, ChevronUp, Hash, Globe } from "lucide-react";
import { cn } from "@/lib/utils";


interface TopicsPreviewProps {
  enabled?: boolean;
}

export default function TopicsPreview({ enabled = true }: TopicsPreviewProps) {
  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<StudentSubject | null>(null);
  // Get current subject from URL to filter subjects
  const getCurrentSubject = () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/math')) return 'Math';
    if (currentPath.includes('/science')) return 'Science';
    if (currentPath.includes('/physics')) return 'Physics';
    if (currentPath.includes('/chemistry')) return 'Chemistry';
    if (currentPath.includes('/biology')) return 'Biology';
    if (currentPath.includes('/english')) return 'English';
    if (currentPath.includes('/history')) return 'History';
    if (currentPath.includes('/geography')) return 'Geography';
    return null;
  };

  const currentSubject = getCurrentSubject();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  // Don't render anything if disabled
  if (!enabled) {
    return null;
  }

  useEffect(() => {
    if (user?.id && enabled) {
      loadSubjects();
    }
  }, [user?.id, enabled]);

  useEffect(() => {
    if (selectedSubject && enabled) {
      // Validate agent ID before loading topics
      const agentId = selectedSubject.subject_agent_id;
      if (agentId && agentId.trim() !== '') {
        // Check if it's a constructed pattern like agent_resumescience (invalid)
        const looksLikeConstructedPattern = agentId.match(/^agent_[a-z]+$/);
        if (!looksLikeConstructedPattern) {
          loadTopics();
        } else {
          console.log('TopicsPreview - Skipping constructed agent ID pattern:', agentId);
        }
      } else {
        console.log('TopicsPreview - No valid agent ID provided, skipping topics loading');
      }
    }
  }, [selectedSubject, enabled]);

  const loadSubjects = async () => {
    if (!user?.id || !enabled) return;
    
    try {
      setIsLoadingSubjects(true);
      const response = await getStudentAgent(user.id);
      const subjectsData = response.student_subjects || [];
      setSubjects(subjectsData);
      
      // Auto-select first subject
      if (subjectsData.length > 0 && !selectedSubject) {
        setSelectedSubject(subjectsData[0]);
      }
    } catch (error) {
      console.error('Failed to load subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const loadTopics = async () => {
    if (!selectedSubject || !enabled) return;
    
    try {
      setIsLoadingTopics(true);
      const response = await extractTopicsFromAgent(selectedSubject.subject_agent_id);
      const topicsData = response.topics || [];
      setTopics(topicsData.slice(0, 6)); // Limit to 6 topics for better UI
    } catch (error: any) {
      console.error('Failed to load topics:', error);
      
      // Handle 404 errors gracefully - this means the agent doesn't exist
      if (error.response?.status === 404) {
        console.log(`Agent ${selectedSubject.subject_agent_id} not found`);
        // Don't show error toast for TopicsPreview as it's meant to be silent
      } else {
        toast.error('Failed to load topics');
      }
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const toggleTopicExpansion = (topicName: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicName)) {
        newSet.delete(topicName);
      } else {
        newSet.add(topicName);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-3 flex items-center justify-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Explore Topics
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover interesting topics to start learning with your AI tutor
        </p>
      </div>

      {/* Subject Selector */}
      {subjects.length > 1 && (
        <div className="flex justify-center">
          <div className="inline-flex gap-1 p-1 bg-muted rounded-lg">
            {subjects
              .filter(subject => currentSubject ? subject.name === currentSubject : true)
              .map((subject) => (
              <Button
                key={subject.subject_agent_id}
                variant={selectedSubject?.subject_agent_id === subject.subject_agent_id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedSubject(subject)}
                className="text-xs"
              >
                {subject.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Topics Display */}
      {selectedSubject && (
        <>
          {isLoadingTopics ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-3 text-muted-foreground">Loading topics...</span>
            </div>
          ) : topics.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic, index) => (
                <Card 
                  key={index} 
                  className="border-l-4 border-l-primary/50 bg-gradient-to-br from-muted/30 to-background hover:shadow-lg transition-all duration-300 hover:scale-[1.03] cursor-pointer group"
                >
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Hash className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
                            {topic.topic}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                            {topic.description}
                          </p>
                        </div>
                      </div>
                      
                      {topic.subtopics && topic.subtopics.length > 0 && (
                        <div className="mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTopicExpansion(topic.topic)}
                            className="h-7 px-3 text-xs hover:bg-primary/10"
                          >
                            {expandedTopics.has(topic.topic) ? (
                              <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3 mr-1" />
                                {topic.subtopics.length} subtopics
                              </>
                            )}
                          </Button>
                          
                          {expandedTopics.has(topic.topic) && (
                            <div className="mt-3 space-y-2">
                              {topic.subtopics.slice(0, 3).map((subtopic, subIndex) => (
                                <div key={subIndex} className="text-sm text-muted-foreground flex items-center gap-2 pl-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                  {subtopic.subtopic}
                                </div>
                              ))}
                              {topic.subtopics.length > 3 && (
                                <div className="text-sm text-muted-foreground italic pl-2">
                                  +{topic.subtopics.length - 3} more...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-6 text-muted-foreground/30" />
              <p className="text-muted-foreground text-lg">No topics available for {selectedSubject.name}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
