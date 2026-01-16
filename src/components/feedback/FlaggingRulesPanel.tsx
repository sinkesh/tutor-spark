import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  Plus,
  Code,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlaggingRule } from "@/types/feedback";

interface FlaggingRulesPanelProps {
  rules: FlaggingRule[];
  onToggleRule: (id: string, active: boolean) => void;
  onAddRule: () => void;
}

const priorityColors = {
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

export function FlaggingRulesPanel({ rules, onToggleRule, onAddRule }: FlaggingRulesPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Auto-Flagging Rules
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onAddRule}>
            <Plus className="w-3 h-3 mr-1" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {rules.map((rule) => (
              <div 
                key={rule.id} 
                className={cn(
                  "p-3 rounded-lg border transition-opacity",
                  !rule.isActive && "opacity-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground mt-1 cursor-grab" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{rule.name}</span>
                        <Badge variant="outline" className={cn("text-xs", priorityColors[rule.priority])}>
                          {rule.priority}
                        </Badge>
                      </div>
                      <Switch 
                        checked={rule.isActive} 
                        onCheckedChange={(checked) => onToggleRule(rule.id, checked)} 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{rule.description}</p>
                    <div className="p-2 bg-secondary/50 rounded font-mono text-xs flex items-center gap-2">
                      <Code className="w-3 h-3 text-muted-foreground" />
                      <code className="text-primary">{rule.condition}</code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
