import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity,
  Brain,
  ThumbsUp,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentMetrics, TrendDirection } from "@/types/feedback";

interface AgentHealthCardProps {
  metrics: AgentMetrics;
  agentName: string;
}

const trendIcons: Record<TrendDirection, typeof TrendingUp> = {
  improving: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
};

const trendColors: Record<TrendDirection, string> = {
  improving: 'text-green-500',
  stable: 'text-muted-foreground',
  declining: 'text-red-500',
};

export function AgentHealthCard({ metrics, agentName }: AgentHealthCardProps) {
  const TrendIcon = trendIcons[metrics.healthTrend];
  
  const healthColor = metrics.healthScore >= 80 
    ? 'text-green-500' 
    : metrics.healthScore >= 60 
      ? 'text-yellow-500' 
      : 'text-red-500';

  const healthBgColor = metrics.healthScore >= 80 
    ? 'bg-green-500' 
    : metrics.healthScore >= 60 
      ? 'bg-yellow-500' 
      : 'bg-red-500';

  const metricItems = [
    {
      label: 'Accuracy',
      value: metrics.accuracyScore,
      trend: metrics.accuracyTrend,
      delta: metrics.accuracyDelta,
      icon: Activity,
    },
    {
      label: 'Confidence',
      value: Math.round(metrics.avgConfidence * 100),
      trend: metrics.confidenceTrend,
      delta: Math.round(metrics.confidenceDelta * 100),
      icon: Brain,
    },
    {
      label: 'Positive Rate',
      value: Math.round(metrics.positiveRate),
      trend: metrics.positiveRate > 75 ? 'improving' : metrics.positiveRate > 50 ? 'stable' : 'declining',
      icon: ThumbsUp,
    },
    {
      label: 'Stability',
      value: Math.round(metrics.responseConsistency * 100),
      trend: metrics.responseConsistency > 0.85 ? 'improving' : metrics.responseConsistency > 0.7 ? 'stable' : 'declining',
      icon: Shield,
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{agentName}</CardTitle>
          <Badge 
            variant="outline" 
            className={cn("flex items-center gap-1", trendColors[metrics.healthTrend])}
          >
            <TrendIcon className="w-3 h-3" />
            {metrics.healthTrend}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Score */}
        <div className="flex items-center gap-4">
          <div className={cn("text-3xl font-bold", healthColor)}>
            {metrics.healthScore}
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Agent Health Score</p>
            <Progress value={metrics.healthScore} className={cn("h-2", `[&>div]:${healthBgColor}`)} />
          </div>
        </div>

        {/* Metric Breakdown */}
        <div className="grid grid-cols-2 gap-2">
          {metricItems.map((item) => {
            const ItemTrendIcon = trendIcons[item.trend as TrendDirection];
            return (
              <div key={item.label} className="p-2 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <item.icon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <ItemTrendIcon className={cn("w-3 h-3", trendColors[item.trend as TrendDirection])} />
                </div>
                <p className="text-lg font-semibold">{item.value}%</p>
              </div>
            );
          })}
        </div>

        {/* Hallucination Rate Warning */}
        {metrics.hallucinationRate > 5 && (
          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-xs text-red-500 font-medium">
              ⚠️ High hallucination rate: {metrics.hallucinationRate.toFixed(1)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
