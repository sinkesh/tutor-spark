import { useState, useEffect } from "react";
import { getAgentTopics } from "@/config/services";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Sparkles, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface TopicsDropdownProps {
  agentId?: string;
  agentName?: string;
}

export default function TopicsDropdown({ agentId, agentName }: TopicsDropdownProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !agentId || topics.length > 0) return;

    const loadTopics = async () => {
      setIsLoading(true);
      try {
        const response = await getAgentTopics(agentId);
        const topicsData = response?.topics || response?.extracted_topics || [];
        setTopics(Array.isArray(topicsData) ? topicsData : []);
      } catch {
        setTopics([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopics();
  }, [open, agentId]);

  if (!agentId) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 text-fuchsia-500" />
          Topics
          {topics.length > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5">
              {topics.length}
            </Badge>
          )}
          <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[420px] p-0"
        sideOffset={8}
      >
        <div className="border-b p-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-fuchsia-500" />
          <span className="text-sm font-semibold">
            {agentName ? `${agentName} Topics` : "Topics"}
          </span>
          {isLoading && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
        </div>

        <ScrollArea className="h-[400px]">
          <div className="p-3 space-y-3">
            {isLoading && topics.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading topics...
              </div>
            ) : topics.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No topics available for this agent.
              </div>
            ) : (
              topics.map((topic, index) => {
                const isExpanded = expandedTopic === topic.topic;
                return (
                  <div
                    key={index}
                    className={cn(
                      "rounded-xl border p-3 transition-all cursor-pointer",
                      "bg-white/50 hover:bg-white/80 hover:border-fuchsia-200",
                      "dark:bg-white/5 dark:hover:border-fuchsia-500/30",
                      isExpanded && "ring-2 ring-fuchsia-300"
                    )}
                    onClick={() => setExpandedTopic(isExpanded ? null : topic.topic)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold leading-tight line-clamp-1">
                          {topic.topic}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {topic.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Badge
                          variant={topic.confidence >= 0.9 ? "default" : "secondary"}
                          className={cn(
                            "text-[10px]",
                            topic.confidence >= 0.9
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                              : ""
                          )}
                        >
                          {(topic.confidence * 100).toFixed(0)}%
                        </Badge>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-muted-foreground transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </div>
                    </div>

                    {/* Subtopics preview */}
                    {topic.subtopics && topic.subtopics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {topic.subtopics.slice(0, isExpanded ? undefined : 2).map((sub, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-[9px] px-1.5 py-0.5 border-fuchsia-200/60 bg-fuchsia-50/50 text-fuchsia-700 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300"
                          >
                            {sub.subtopic.length > 20 ? sub.subtopic.substring(0, 20) + '...' : sub.subtopic}
                          </Badge>
                        ))}
                        {!isExpanded && topic.subtopics.length > 2 && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0.5">
                            +{topic.subtopics.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Expanded subtopics */}
                    {isExpanded && topic.subtopics && topic.subtopics.length > 0 && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        {topic.subtopics.map((sub, sIdx) => (
                          <div key={sIdx} className="ml-1">
                            <p className="text-xs font-medium">{sub.subtopic}</p>
                            <p className="text-[11px] text-muted-foreground line-clamp-2">
                              {sub.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
