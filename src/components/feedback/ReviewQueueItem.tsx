/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Brain,
  ThumbsDown,
  RefreshCw,
  Zap,
  Clock,
  Bot,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentPerformanceItem {
  subject_agent_id: string;
  database: string;
  collection: string;
  document_id: string;

  agent_metadata: {
    agent_name: string;
    agent_type: string;
    description: string;
    teaching_tone: string;
  };

  metrics: {
    overall_score: number;
    critical_confidence: number;
    rag_relevance: number;
    answer_completeness: number;
    hallucination_risk: number;
    pedagogical_value: number;
    satisfaction_rate: number;
    feedback_counts: {
      like: number;
      dislike: number;
      neutral: number;
    };
    confusion_distribution: object;
  };

  performance_level: string;
  total_conversations: number;
  unique_students: number;
  last_updated: string;
}

interface Props {
  item: AgentPerformanceItem;
  isSelected: boolean;
  onSelect: () => void;
}

export function AgentPerformanceCard({ item, isSelected, onSelect }: Props) {
  // Safe access with fallbacks
  const score = item.metrics?.overall_score ?? 0;
  const performanceLevel = item.performance_level ?? "Unknown";
  const totalConversations = item.total_conversations ?? 0;
  const healthStatus = item.performance_level ?? "Unknown";
  const agentName = item.agent_metadata?.agent_name ?? "Unknown Agent";

  let color = "text-blue-500 bg-blue-500/10";
  let borderColor = "border-l-blue-500";

  if (score >= 80) {
    color = "text-green-500 bg-green-500/10";
    borderColor = "border-l-green-500";
  } else if (score >= 50) {
    color = "text-yellow-500 bg-yellow-500/10";
    borderColor = "border-l-yellow-500";
  } else {
    color = "text-red-500 bg-red-500/10";
    borderColor = "border-l-red-500";
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-5 border-l-4 rounded-r-xl cursor-pointer transition-all duration-200",
        "hover:bg-accent/50 shadow-sm",
        borderColor,
        isSelected ? "bg-[#f6b9a3] shadow-md scale-[1.01]" : "bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center",
                color.split(" ")[1],
              )}
            >
              <Brain className={cn("w-4 h-4", color.split(" ")[0])} />
            </div>

            <Badge
              variant="outline"
              className={cn("text-xs", color.split(" ")[0])}
            >
              {performanceLevel}
            </Badge>

            <Badge variant="secondary" className="text-xs">
              {healthStatus}
            </Badge>
          </div>

          {/* Agent Name */}
          <p className="text-sm font-semibold text-foreground mb-2">
            {item.agent_metadata.agent_name}
          </p>

          {/* Info Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>Database: {item.database}</span>

            <span>Collection: {item.collection}</span>

            <span>Conversations: {totalConversations}</span>
          </div>
        </div>

        {/* Score Section */}
        <div className="flex flex-col items-end gap-2">
          <div
            className={cn(
              "text-2xl font-bold",
              score >= 80
                ? "text-green-500"
                : score >= 50
                  ? "text-yellow-500"
                  : "text-red-500",
            )}
          >
            {Math.round(score) === 0 ? "NA" : `${Math.round(score)}%`}
          </div>

          <ChevronRight
            className={cn(
              "w-4 h-4 transition-transform",
              isSelected ? "text-primary" : "text-muted-foreground",
            )}
          />
        </div>
      </div>
    </div>
  );
}
