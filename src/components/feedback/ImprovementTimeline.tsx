import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  Edit2, 
  FileText, 
  Upload, 
  Zap,
  GitBranch,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReinforcementAction, ReinforcementStage } from "@/types/feedback";

interface ImprovementTimelineProps {
  actions: ReinforcementAction[];
}

const stageConfig: Record<ReinforcementStage, { icon: typeof Edit2; label: string; color: string }> = {
  prompt_reinforcement: { icon: Edit2, label: 'Prompt Update', color: 'bg-blue-500' },
  rag_optimization: { icon: FileText, label: 'RAG Optimization', color: 'bg-purple-500' },
  fine_tuning: { icon: Zap, label: 'Fine-tuning', color: 'bg-orange-500' },
};

export function ImprovementTimeline({ actions }: ImprovementTimelineProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <GitBranch className="w-4 h-4" />
          Improvement Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-4">
              {actions.map((action, idx) => {
                const config = stageConfig[action.stage];
                const StageIcon = config.icon;
                const accuracyChange = action.afterMetrics 
                  ? action.afterMetrics.accuracyScore - action.beforeMetrics.accuracyScore 
                  : null;
                const confidenceChange = action.afterMetrics 
                  ? (action.afterMetrics.avgConfidence - action.beforeMetrics.avgConfidence) * 100
                  : null;

                return (
                  <div key={action.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute left-0 w-9 h-9 rounded-full flex items-center justify-center",
                      action.status === 'completed' ? config.color : 'bg-muted'
                    )}>
                      {action.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <StageIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{config.label}</span>
                          <Badge variant={
                            action.status === 'completed' ? 'outline' :
                            action.status === 'in_progress' ? 'default' :
                            action.status === 'failed' ? 'destructive' : 'secondary'
                          } className="text-xs capitalize">
                            {action.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {action.triggerType}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">{action.triggerReason}</p>

                      {action.status === 'completed' && action.afterMetrics && (
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Accuracy:</span>
                            <span className={cn(
                              "font-medium flex items-center gap-0.5",
                              accuracyChange! >= 0 ? 'text-green-500' : 'text-red-500'
                            )}>
                              {accuracyChange! >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                              {Math.abs(accuracyChange!).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Confidence:</span>
                            <span className={cn(
                              "font-medium flex items-center gap-0.5",
                              confidenceChange! >= 0 ? 'text-green-500' : 'text-red-500'
                            )}>
                              {confidenceChange! >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                              {Math.abs(confidenceChange!).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        {action.completedAt 
                          ? `Completed ${new Date(action.completedAt).toLocaleDateString()}`
                          : action.startedAt 
                            ? `Started ${new Date(action.startedAt).toLocaleDateString()}`
                            : 'Pending'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
