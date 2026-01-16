import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Brain, 
  ThumbsDown, 
  RefreshCw, 
  Zap,
  Clock,
  Bot,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewItem, FailureType } from "@/types/feedback";

interface ReviewQueueItemProps {
  item: ReviewItem;
  isSelected: boolean;
  onSelect: () => void;
}

const failureTypeConfig: Record<FailureType, { icon: typeof AlertTriangle; label: string; color: string }> = {
  negative_feedback: { icon: ThumbsDown, label: 'Negative Feedback', color: 'text-red-500 bg-red-500/10' },
  low_confidence: { icon: Brain, label: 'Low Confidence', color: 'text-yellow-500 bg-yellow-500/10' },
  hallucination: { icon: AlertTriangle, label: 'Hallucination', color: 'text-orange-500 bg-orange-500/10' },
  repeat_failure: { icon: RefreshCw, label: 'Repeat Failure', color: 'text-purple-500 bg-purple-500/10' },
  pattern_detected: { icon: Zap, label: 'Pattern Detected', color: 'text-blue-500 bg-blue-500/10' },
};

export function ReviewQueueItem({ item, isSelected, onSelect }: ReviewQueueItemProps) {
  const config = failureTypeConfig[item.failureType];
  const FailureIcon = config.icon;
  
  const priorityColor = item.priority >= 80 
    ? 'border-l-red-500' 
    : item.priority >= 50 
      ? 'border-l-yellow-500' 
      : 'border-l-muted';

  const confidenceDisplay = Math.round(item.qualityScore.overallScore * 100);

  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-4 border-l-4 rounded-r-lg cursor-pointer transition-all duration-200",
        "hover:bg-accent/50",
        priorityColor,
        isSelected ? "bg-accent shadow-md" : "bg-card"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Failure Type Badge */}
          <div className="flex items-center gap-2 mb-2">
            <div className={cn("w-6 h-6 rounded flex items-center justify-center", config.color.split(' ')[1])}>
              <FailureIcon className={cn("w-3.5 h-3.5", config.color.split(' ')[0])} />
            </div>
            <Badge variant="outline" className={cn("text-xs", config.color.split(' ')[0])}>
              {config.label}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              P{item.priority}
            </Badge>
          </div>
          
          {/* Question Preview */}
          <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">
            {item.studentQuery}
          </p>
          
          {/* Agent Info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bot className="w-3 h-3" />
              {item.agentName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {/* Confidence Score */}
        <div className="flex flex-col items-end gap-2">
          <div className={cn(
            "text-lg font-bold",
            confidenceDisplay >= 70 ? "text-green-500" :
            confidenceDisplay >= 45 ? "text-yellow-500" : "text-red-500"
          )}>
            {confidenceDisplay}%
          </div>
          <ChevronRight className={cn(
            "w-4 h-4 transition-transform",
            isSelected ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
      </div>
    </div>
  );
}
