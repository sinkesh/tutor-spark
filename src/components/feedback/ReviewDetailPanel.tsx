import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Bot,
  CheckCircle,
  Edit2,
  FileText,
  Upload,
  XCircle,
  History,
  Zap,
  Brain,
  Target,
  Shield,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewItem, CorrectionType } from "@/types/feedback";

interface ReviewDetailPanelProps {
  item: ReviewItem;
  onResolve: (
    id: string,
    correctionType: CorrectionType,
    notes: string,
  ) => void;
  onDismiss: (id: string) => void;
  onEscalate: (id: string) => void;
}

export function ReviewDetailPanel({
  item,
  onResolve,
  onDismiss,
  onEscalate,
}: ReviewDetailPanelProps) {
  const [notes, setNotes] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [selectedAction, setSelectedAction] = useState<CorrectionType | null>(
    null,
  );

  const qualityMetrics = [
    {
      label: "Model Certainty",
      value: item.qualityScore.modelCertainty,
      icon: Brain,
      description: "Token probability from LLM",
    },
    {
      label: "RAG Relevance",
      value: item.qualityScore.ragRelevance,
      icon: Target,
      description: "Vector similarity score",
    },
    {
      label: "Answer Completeness",
      value: item.qualityScore.answerCompleteness,
      icon: CheckCircle,
      description: "Intent coverage",
    },
    {
      label: "Hallucination Risk",
      value: 1 - item.qualityScore.hallucinationRisk,
      icon: Shield,
      description: "Lower is higher risk",
      inverted: true,
    },
  ];

  const correctionActions: {
    type: CorrectionType;
    label: string;
    icon: typeof Edit2;
    description: string;
  }[] = [
    {
      type: "prompt_edit",
      label: "Edit Prompt",
      icon: Edit2,
      description: "Modify agent system prompt",
    },
    {
      type: "rag_update",
      label: "Update RAG",
      icon: FileText,
      description: "Re-index or add documents",
    },
    {
      type: "knowledge_add",
      label: "Add Knowledge",
      icon: Upload,
      description: "Upload corrective content",
    },
    {
      type: "config_change",
      label: "Config Change",
      icon: Zap,
      description: "Adjust model parameters",
    },
  ];

  const handleResolve = () => {
    if (selectedAction) {
      onResolve(item.id, selectedAction, notes);
    }
  };
  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{item.agentName}</h3>
                <p className="text-sm text-muted-foreground">
                  v{item.agentVersion} • {item.promptVersion}
                </p>
              </div>
            </div>
            <Badge
              variant={
                item.status === "pending"
                  ? "secondary"
                  : item.status === "in_review"
                    ? "default"
                    : item.status === "resolved"
                      ? "outline"
                      : "destructive"
              }
            >
              {item.status.replace("_", " ")}
            </Badge>
          </div>

          {/* Quality Score Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Quality Score Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {Math.round(item.qualityScore.overallScore * 100)}%
                </span>
                <Badge
                  variant={
                    item.qualityScore.confidenceBucket === "high"
                      ? "outline"
                      : item.qualityScore.confidenceBucket === "medium"
                        ? "secondary"
                        : item.qualityScore.confidenceBucket === "low"
                          ? "default"
                          : "destructive"
                  }
                  className="capitalize"
                >
                  {item.qualityScore.confidenceBucket} confidence
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {qualityMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="p-3 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <metric.icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {metric.label}
                      </span>
                    </div>
                    <Progress
                      value={metric.value * 100}
                      className={cn(
                        "h-2",
                        metric.inverted &&
                          metric.value < 0.5 &&
                          "[&>div]:bg-red-500",
                      )}
                    />
                    <span className="text-sm font-medium mt-1 block">
                      {Math.round(metric.value * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interaction Details */}
          <Tabs defaultValue="interaction" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="interaction">Interaction</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="interaction" className="space-y-4 mt-4">
              {/* Context Toggle */}
              {item.conversationContext.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowContext(!showContext)}
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Conversation Context ({item.conversationContext.length}{" "}
                    messages)
                  </span>
                  {showContext ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              )}

              {showContext && (
                <div className="space-y-2 p-3 bg-secondary/30 rounded-lg">
                  {item.conversationContext.map((msg, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-muted-foreground p-2 bg-background rounded"
                    >
                      {msg}
                    </div>
                  ))}
                </div>
              )}

              {/* Student Question */}
              <div className="p-4 bg-accent/50 rounded-lg border-l-4 border-l-primary">
                <p className="text-xs text-muted-foreground mb-1 font-medium">
                  Student Question
                </p>
                <p className="text-sm">{item.studentQuery}</p>
              </div>

              {/* AI Response */}
              <div className="p-4 bg-destructive/10 rounded-lg border-l-4 border-l-destructive">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                  <p className="text-xs text-destructive font-medium">
                    Flagged Response
                  </p>
                </div>
                <p className="text-sm">{item.aiResponse}</p>
              </div>
            </TabsContent>

            <TabsContent value="sources" className="mt-4">
              <div className="space-y-3">
                {item.sourcesUsed.length > 0 ? (
                  item.sourcesUsed.map((source, idx) => (
                    <Card key={idx} className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {source.documentName}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(source.relevanceScore * 100)}% match
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {source.content}
                      </p>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No source chunks retrieved</p>
                    <p className="text-xs">
                      This may indicate RAG retrieval issues
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <div className="space-y-3">
                {item.feedbackEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <History className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium capitalize">
                        {event.type.replace("_", " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Weight: {event.weight.toFixed(2)} •{" "}
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Correction Actions */}
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Correction Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="w-full space-y-3">
              <div className="w-full grid xl:grid-cols-2 grid-cols-1 gap-2">
                {correctionActions.map((action) => (
                  <Button
                    key={action.type}
                    variant={
                      selectedAction === action.type ? "default" : "outline"
                    }
                    className="w-full h-auto py-3 px-3 flex flex-col items-start gap-1 text-left"
                    onClick={() => setSelectedAction(action.type)}
                  >
                    <div className="flex items-center gap-2">
                      <action.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {action.label}
                      </span>
                    </div>

                    <span className="text-xs text-muted-foreground font-normal whitespace-pre-line break-words w-full">
                      {action.description}
                    </span>
                  </Button>
                ))}
              </div>

              <Textarea
                placeholder="Add resolution notes (required)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="p-4 border-t bg-background space-y-2">
        <Button
          className="w-full"
          disabled={!selectedAction || !notes.trim()}
          onClick={handleResolve}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Resolve & Apply Correction
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => onEscalate(item.id)}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Escalate
          </Button>
          <Button variant="ghost" onClick={() => onDismiss(item.id)}>
            <XCircle className="w-4 h-4 mr-2" />
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
