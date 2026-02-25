import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIAgent } from "@/types";
import { cn } from "@/lib/utils";
import {
  Bot,
  Users,
  MessageCircle,
  TrendingUp,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AgentCardProps {
  agent: AIAgent;
  onView?: (agent: AIAgent) => void;
  onEdit?: (agent: AIAgent) => void;
  onDelete?: (id: string) => Promise<void>;
}

// const typeColors: Record<string, string> = {
//   class: "bg-primary/10 text-primary",
//   subject: "bg-accent/10 text-accent",
//   course: "bg-success/10 text-success",
//   teacher: "bg-warning/10 text-warning",
// };

const colorClasses = [
  "bg-primary/10 text-primary",
  "bg-accent/10 text-accent",
  "bg-success/10 text-success",
  "bg-warning/10 text-warning",
  "bg-destructive/10 text-destructive",
];

// function getColorBySeed(seed: string) {
//   let hash = 0;
//   for (let i = 0; i < seed.length; i++) {
//     hash = seed.charCodeAt(i) + ((hash << 5) - hash);
//   }
//   return colorClasses[Math.abs(hash) % colorClasses.length];
// }

function getRandomColor() {
  return colorClasses[Math.floor(Math.random() * colorClasses.length)];
}

// const statusColors: Record<string, string> = {
//   active: "bg-success/10 text-success border-success/20",
//   draft: "bg-muted text-muted-foreground border-muted",
//   disabled: "bg-destructive/10 text-destructive border-destructive/20",
// };

export default function AgentCard({
  agent,
  onView,
  onEdit,
  onDelete,
}: AgentCardProps) {
  return (
    <Card variant="interactive" className="group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                getRandomColor(),
              )}
            >
              {agent?.agent_type === "teaching" ||
              agent?.agent_type === "teacher" ? (
                <UserCheck className="w-5 h-5" />
              ) : agent?.agent_type === "subject" ? (
                <BookOpen className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
            </div>
            <div>
              <CardTitle className="text-base capitalize">
                {agent?.agent_name || "Unnamed Agent"}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {/* <Badge
                  variant="outline"
                  className={cn(
                    "text-xs capitalize",
                    statusColors[agent.status]
                  )}
                >
                  {agent?.status}
                </Badge> */}
                <Badge variant="secondary" className="text-xs">
                  {agent.class === "none" ? "For All" : agent.class}
                </Badge>
              </div>
            </div>
          </div>
          {onView === undefined && onEdit === undefined && onDelete === undefined ? null : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onView?.(agent)}
                className="cursor-pointer"
                disabled={onView === undefined}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit?.(agent)}
                className="cursor-pointer"
                disabled={onEdit === undefined}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(agent.subject_agent_id)}
                className="text-destructive cursor-pointer"
                disabled={onDelete === undefined}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-11">
          {agent.description}
        </p>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {agent.unique_students === 0 ? "NA" : agent.unique_students}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {agent.total_conversations === 0
                ? "NA"
                : agent.total_conversations}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">
              {agent.overall_score === 0 ? "NA" : `${agent.overall_score}%`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
