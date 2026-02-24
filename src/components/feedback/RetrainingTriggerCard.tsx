import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Zap,
  Clock,
  BarChart3,
  AlertCircle,
  Play,
  Settings,
} from "lucide-react";
import type { RetrainingTrigger } from "@/types/feedback";

interface RetrainingTriggerCardProps {
  trigger: RetrainingTrigger;
  onToggle: (id: string, active: boolean) => void;
  onTriggerManually: (id: string) => void;
}

const thresholdTypeIcons = {
  quantitative: BarChart3,
  pattern_based: Zap,
  time_based: Clock,
};

export function RetrainingTriggerCard({
  trigger,
  onToggle,
  onTriggerManually,
}: RetrainingTriggerCardProps) {
  const ThresholdIcon = thresholdTypeIcons[trigger.thresholdType];

  return (
    <Card
      className={
        !trigger.isActive
          ? "opacity-60 pointer-events-none"
          : "opacity-60 pointer-events-none"
      }
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ThresholdIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">
                {trigger.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground capitalize">
                {trigger.thresholdType.replace("_", " ")}
              </p>
            </div>
          </div>
          <Switch
            checked={trigger.isActive}
            onCheckedChange={(checked) => onToggle(trigger.id, checked)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{trigger.description}</p>

        {/* Condition Display */}
        <div className="p-3 bg-secondary/50 rounded-lg font-mono text-xs">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-3 h-3" />
            <span className="text-muted-foreground">Condition:</span>
          </div>
          <code className="text-primary">
            {trigger.condition.metric} {trigger.condition.operator}{" "}
            {trigger.condition.threshold} over {trigger.condition.windowPeriod}{" "}
            (min {trigger.condition.minimumSamples} samples)
          </code>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {trigger.autoApprove ? (
              <Badge
                variant="outline"
                className="text-xs bg-green-500/10 text-green-500 border-green-500/20"
              >
                Auto-approve
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                Requires approval
              </Badge>
            )}
          </div>
          <span className="text-muted-foreground">
            Triggered {trigger.triggerCount} times
          </span>
        </div>

        {trigger.lastTriggered && (
          <p className="text-xs text-muted-foreground">
            Last triggered:{" "}
            {new Date(trigger.lastTriggered).toLocaleDateString()}
          </p>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onTriggerManually(trigger.id)}
        >
          <Play className="w-3 h-3 mr-2" />
          Trigger Manually
        </Button>
      </CardContent>
    </Card>
  );
}
