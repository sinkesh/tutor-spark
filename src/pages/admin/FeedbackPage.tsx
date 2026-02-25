/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Brain,
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  Zap,
  Activity,
  RefreshCw,
} from "lucide-react";

import { FeedbackStatsCard } from "@/components/feedback/FeedbackStatsCard";
import { AgentPerformanceCard } from "@/components/feedback/ReviewQueueItem";
import { ReviewDetailPanel } from "@/components/feedback/ReviewDetailPanel";
import { AgentHealthCard } from "@/components/feedback/AgentHealthCard";
import { RetrainingTriggerCard } from "@/components/feedback/RetrainingTriggerCard";
import { FlaggingRulesPanel } from "@/components/feedback/FlaggingRulesPanel";
import { ImprovementTimeline } from "@/components/feedback/ImprovementTimeline";

import type {
  ReviewItem,
  AgentMetrics,
  RetrainingTrigger,
  FlaggingRule,
  ReinforcementAction,
  CorrectionType,
} from "@/types/feedback";
import {
  getAllAgentPerformance,
  getSingleAgentPerformance,
} from "@/config/services";
import { AgentPerformanceCardSkeleton } from "@/components/loader/AgentPerformanceCardSkeleton";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "@/components/common/PaginationComponent";

// Mock data
const mockReviewItems: ReviewItem[] = [
  {
    id: "1",
    responseId: "r1",
    agentId: "a1",
    agentName: "Advanced Mathematics Tutor",
    agentVersion: "2.1.0",
    studentQuery: "What is the derivative of e^x?",
    aiResponse:
      "The derivative of e^x is x*e^(x-1). This follows the power rule.",
    conversationContext: ["Previous: Can you help with calculus?"],
    qualityScore: {
      id: "q1",
      responseId: "r1",
      modelCertainty: 0.45,
      ragRelevance: 0.65,
      answerCompleteness: 0.7,
      hallucinationRisk: 0.85,
      overallScore: 0.42,
      confidenceBucket: "critical",
      calculatedAt: new Date(),
      version: "1.0",
    },
    feedbackEvents: [
      {
        id: "f1",
        responseId: "r1",
        agentId: "a1",
        studentId: "s1",
        sessionId: "sess1",
        contextHash: "hash1",
        type: "thumbs_down",
        source: "explicit",
        createdAt: new Date(),
        weight: 0.9,
        weightFactors: {
          confidenceMultiplier: 1.5,
          frequencyMultiplier: 1.0,
          recencyMultiplier: 1.0,
          userReliabilityScore: 0.95,
        },
      },
    ],
    sourcesUsed: [
      {
        id: "s1",
        documentName: "Calculus_Fundamentals.pdf",
        content: "The exponential function e^x has a unique property...",
        relevanceScore: 0.65,
        chunkIndex: 12,
      },
    ],
    promptVersion: "v3.2",
    failureType: "hallucination",
    priority: 92,
    priorityFactors: {
      failureFrequency: 0.8,
      studentImpact: 15,
      topicImportance: 0.9,
      timeSensitivity: 0.7,
    },
    status: "pending",
    createdAt: new Date("2024-01-20T14:32:15"),
    updatedAt: new Date(),
  },
  {
    id: "2",
    responseId: "r2",
    agentId: "a2",
    agentName: "Physics Teacher",
    agentVersion: "1.5.0",
    studentQuery: "Explain quantum entanglement in simple terms",
    aiResponse:
      "Quantum entanglement is when particles become connected and measuring one instantly affects the other, no matter the distance...",
    conversationContext: [],
    qualityScore: {
      id: "q2",
      responseId: "r2",
      modelCertainty: 0.32,
      ragRelevance: 0.28,
      answerCompleteness: 0.55,
      hallucinationRisk: 0.4,
      overallScore: 0.35,
      confidenceBucket: "critical",
      calculatedAt: new Date(),
      version: "1.0",
    },
    feedbackEvents: [
      {
        id: "f2",
        responseId: "r2",
        agentId: "a2",
        studentId: "s2",
        sessionId: "sess2",
        contextHash: "hash2",
        type: "rephrased_question",
        source: "implicit",
        createdAt: new Date(),
        weight: 0.6,
        weightFactors: {
          confidenceMultiplier: 1.8,
          frequencyMultiplier: 1.2,
          recencyMultiplier: 1.0,
          userReliabilityScore: 0.88,
        },
      },
    ],
    sourcesUsed: [],
    promptVersion: "v2.0",
    failureType: "low_confidence",
    priority: 78,
    priorityFactors: {
      failureFrequency: 0.5,
      studentImpact: 8,
      topicImportance: 0.85,
      timeSensitivity: 0.5,
    },
    status: "pending",
    createdAt: new Date("2024-01-20T13:15:00"),
    updatedAt: new Date(),
  },
  {
    id: "3",
    responseId: "r3",
    agentId: "a3",
    agentName: "English Literature Guide",
    agentVersion: "3.0.1",
    studentQuery: "Who wrote Romeo and Juliet and when?",
    aiResponse: "Romeo and Juliet was written by Christopher Marlowe in 1597.",
    conversationContext: [
      "Tell me about Shakespeare",
      "What are his famous works?",
    ],
    qualityScore: {
      id: "q3",
      responseId: "r3",
      modelCertainty: 0.78,
      ragRelevance: 0.82,
      answerCompleteness: 0.9,
      hallucinationRisk: 0.95,
      overallScore: 0.68,
      confidenceBucket: "medium",
      calculatedAt: new Date(),
      version: "1.0",
    },
    feedbackEvents: [
      {
        id: "f3",
        responseId: "r3",
        agentId: "a3",
        studentId: "s3",
        sessionId: "sess3",
        contextHash: "hash3",
        type: "thumbs_down",
        source: "explicit",
        comment: "Wrong author!",
        createdAt: new Date(),
        weight: 1.0,
        weightFactors: {
          confidenceMultiplier: 1.0,
          frequencyMultiplier: 1.0,
          recencyMultiplier: 1.0,
          userReliabilityScore: 0.92,
        },
      },
    ],
    sourcesUsed: [
      {
        id: "s2",
        documentName: "Literature_Handbook.pdf",
        content: "William Shakespeare wrote Romeo and Juliet...",
        relevanceScore: 0.82,
        chunkIndex: 45,
      },
    ],
    promptVersion: "v4.1",
    failureType: "negative_feedback",
    priority: 85,
    priorityFactors: {
      failureFrequency: 0.3,
      studentImpact: 22,
      topicImportance: 0.7,
      timeSensitivity: 0.8,
    },
    status: "pending",
    createdAt: new Date("2024-01-20T11:45:22"),
    updatedAt: new Date(),
  },
];

const mockAgentMetrics: AgentMetrics[] = [
  {
    agentId: "a1",
    timestamp: new Date(),
    accuracyScore: 87,
    accuracyTrend: "improving",
    accuracyDelta: 3.2,
    avgConfidence: 0.82,
    confidenceTrend: "stable",
    confidenceDelta: 0.01,
    positiveRate: 78,
    negativeRate: 12,
    feedbackSentiment: 0.65,
    responseConsistency: 0.88,
    hallucinationRate: 2.1,
    healthScore: 84,
    healthTrend: "improving",
  },
  {
    agentId: "a2",
    timestamp: new Date(),
    accuracyScore: 72,
    accuracyTrend: "declining",
    accuracyDelta: -5.1,
    avgConfidence: 0.68,
    confidenceTrend: "declining",
    confidenceDelta: -0.08,
    positiveRate: 62,
    negativeRate: 25,
    feedbackSentiment: 0.35,
    responseConsistency: 0.72,
    hallucinationRate: 6.8,
    healthScore: 65,
    healthTrend: "declining",
  },
  {
    agentId: "a3",
    timestamp: new Date(),
    accuracyScore: 94,
    accuracyTrend: "stable",
    accuracyDelta: 0.5,
    avgConfidence: 0.91,
    confidenceTrend: "improving",
    confidenceDelta: 0.03,
    positiveRate: 89,
    negativeRate: 5,
    feedbackSentiment: 0.82,
    responseConsistency: 0.95,
    hallucinationRate: 0.8,
    healthScore: 92,
    healthTrend: "stable",
  },
];

const mockTriggers: RetrainingTrigger[] = [
  {
    id: "t1",
    name: "Accuracy Drop Alert",
    description: "Trigger when agent accuracy drops below threshold",
    thresholdType: "quantitative",
    condition: {
      metric: "accuracy_score",
      operator: "lt",
      threshold: 75,
      windowPeriod: "7d",
      minimumSamples: 50,
    },
    autoApprove: false,
    approvalRequired: ["admin"],
    isActive: true,
    lastTriggered: new Date("2024-01-15"),
    triggerCount: 3,
  },
  {
    id: "t2",
    name: "Hallucination Pattern",
    description: "Detect repeated hallucination patterns",
    thresholdType: "pattern_based",
    condition: {
      metric: "hallucination_rate",
      operator: "gt",
      threshold: 5,
      windowPeriod: "3d",
      minimumSamples: 20,
    },
    autoApprove: false,
    approvalRequired: ["admin", "ml_lead"],
    isActive: true,
    triggerCount: 1,
  },
  {
    id: "t3",
    name: "Weekly Health Check",
    description: "Scheduled weekly model health assessment",
    thresholdType: "time_based",
    condition: {
      metric: "health_score",
      operator: "lt",
      threshold: 80,
      windowPeriod: "7d",
      minimumSamples: 100,
    },
    autoApprove: true,
    approvalRequired: [],
    isActive: true,
    triggerCount: 12,
  },
];

const mockRules: FlaggingRule[] = [
  {
    id: "r1",
    name: "Critical Confidence",
    description: "Flag responses with very low confidence",
    condition: "confidence_score < 0.45",
    priority: "critical",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "r2",
    name: "No Sources Retrieved",
    description: "Flag when RAG returns no relevant chunks",
    condition: "sources_count == 0 AND confidence < 0.7",
    priority: "high",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "r3",
    name: "Repeat Negative Feedback",
    description: "Flag after 3+ negative feedbacks on similar queries",
    condition: "similar_negative_count >= 3",
    priority: "high",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "r4",
    name: "Hallucination Keywords",
    description: "Flag responses containing hallucination indicators",
    condition: "contains_hallucination_patterns == true",
    priority: "critical",
    isActive: true,
    createdAt: new Date(),
  },
];

const mockActions: ReinforcementAction[] = [
  {
    id: "act1",
    agentId: "a1",
    stage: "prompt_reinforcement",
    triggerType: "manual",
    triggerReason: "Fixed derivative calculation instruction",
    changes: [],
    status: "completed",
    startedAt: new Date("2024-01-18"),
    completedAt: new Date("2024-01-18"),
    beforeMetrics: mockAgentMetrics[0],
    afterMetrics: {
      ...mockAgentMetrics[0],
      accuracyScore: 90,
      avgConfidence: 0.85,
    },
    rollbackAvailable: true,
  },
  {
    id: "act2",
    agentId: "a2",
    stage: "rag_optimization",
    triggerType: "automatic",
    triggerReason: "Low confidence on quantum physics topics",
    changes: [],
    status: "in_progress",
    startedAt: new Date("2024-01-20"),
    beforeMetrics: mockAgentMetrics[1],
    rollbackAvailable: false,
  },
  {
    id: "act3",
    agentId: "a3",
    stage: "prompt_reinforcement",
    triggerType: "manual",
    triggerReason: "Updated author attribution guidelines",
    changes: [],
    status: "completed",
    startedAt: new Date("2024-01-10"),
    completedAt: new Date("2024-01-10"),
    beforeMetrics: { ...mockAgentMetrics[2], accuracyScore: 88 },
    afterMetrics: mockAgentMetrics[2],
    rollbackAvailable: true,
  },
];

export default function FeedbackPage() {
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewItems, setReviewItems] = useState(mockReviewItems);
  const [triggers, setTriggers] = useState(mockTriggers);
  const [rules, setRules] = useState(mockRules);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setError] = useState("");
  const [agentPerformance, setAgentPerformance] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(agentPerformance?.length / itemsPerPage);

  const navigate = useNavigate();

  const fetchAgentPerformance = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getAllAgentPerformance();

      if (res?.success) {
        const sortedAgents = (res?.agents || []).sort((a: any, b: any) => {
          const scoreA = a?.metrics?.overall_score ?? 0;
          const scoreB = b?.metrics?.overall_score ?? 0;
          return scoreB - scoreA;
        });

        setAgentPerformance(sortedAgents);
        toast.success("Agent performance data loaded successfully");
      } else {
        throw new Error(res?.message || "Failed to fetch data");
      }
    } catch (err: any) {
      console.error("Performance Fetch Error:", err);
      setError("Failed to load agent performance");
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentPerformance();
  }, []);

  const fetchSingalAgentPerformance = async (id: string) => {
    try {
      setIsLoading(true);

      const res = await getSingleAgentPerformance(id);

      if (res?.success && res?.performance) {
        const performance = res.performance;

        // Safe access with fallbacks
        const overallScore = performance?.metrics?.overall_score ?? 0;
        const hallucinationRisk = performance?.metrics?.hallucination_risk ?? 0;
        const agentId = performance?.subject_agent_id ?? "";
        const agentName =
          performance?.agent_metadata?.agent_name ?? "Unknown Agent";
        const lastUpdated = performance?.last_updated;
        const criticalConfidence =
          performance?.metrics?.critical_confidence ?? 0;
        const ragRelevance = performance?.metrics?.rag_relevance ?? 0;
        const answerCompleteness =
          performance?.metrics?.answer_completeness ?? 0;
        const performancePeriod = performance?.performance_period ?? "unknown";
        const recommend = performance?.recommendations ?? [];

        const transformedItem: ReviewItem = {
          // REQUIRED FIELDS
          id: agentId,
          responseId: agentId,
          agentId: agentId,
          agentName: agentName,
          subject_agent_id: agentId,

          agentVersion: "1.0",
          promptVersion: performancePeriod,

          createdAt: lastUpdated ? new Date(lastUpdated) : new Date(),
          updatedAt: lastUpdated ? new Date(lastUpdated) : new Date(),

          status: "pending", // must match union type in ReviewItem

          failureType:
            hallucinationRisk > 20
              ? "hallucination"
              : overallScore < 50
                ? "low_confidence"
                : "pattern_detected",

          priority: Math.round(overallScore),
          priorityFactors: {
            failureFrequency: 0.5,
            studentImpact: 0,
            topicImportance: 0.7,
            timeSensitivity: 0.5,
          },

          // CONTENT
          studentQuery: `Performance report for ${agentName}`,
          aiResponse: recommend?.join(" ") || "No recommendations available",

          conversationContext: [],
          sourcesUsed: [],

          // FEEDBACK EVENTS
          feedbackEvents: [
            {
              id: `feedback-${agentId}`,
              responseId: agentId,
              agentId: agentId,
              studentId: "unknown",
              sessionId: "unknown",
              contextHash: "unknown",
              type: "thumbs_up",
              source: "automated",
              weight: 1.0,
              weightFactors: {
                confidenceMultiplier: 1.0,
                frequencyMultiplier: 1.0,
                recencyMultiplier: 1.0,
                userReliabilityScore: 0.9,
              },
              createdAt: lastUpdated ? new Date(lastUpdated) : new Date(),
            },
          ],

          // QUALITY SCORE
          qualityScore: {
            id: `quality-${agentId}`,
            responseId: agentId,
            overallScore: overallScore / 100,
            modelCertainty: criticalConfidence / 100,
            ragRelevance: ragRelevance / 100,
            answerCompleteness: answerCompleteness / 100,
            hallucinationRisk: hallucinationRisk / 100,
            confidenceBucket:
              overallScore >= 80
                ? "high"
                : overallScore >= 65
                  ? "medium"
                  : "low",
            calculatedAt: lastUpdated ? new Date(lastUpdated) : new Date(),
            version: "1.0",
          },
        };

        setSelectedItem(transformedItem);
        toast.success("Agent performance loaded");
      } else {
        throw new Error(res?.message || "Failed to fetch data");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to load agent");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = reviewItems.filter((item) => {
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.failureType === typeFilter;
    const matchesSearch =
      item.studentQuery.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.agentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleResolve = (
    id: string,
    correctionType: CorrectionType,
    notes: string,
  ) => {
    setReviewItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, status: "resolved" as const, resolvedAt: new Date() }
          : item,
      ),
    );
    setSelectedItem(null);
    toast.success("Issue resolved and correction applied");
  };

  const handleDismiss = (id: string) => {
    setReviewItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: "dismissed" as const } : item,
      ),
    );
    setSelectedItem(null);
    toast.info("Issue dismissed");
  };

  const handleEscalate = (id: string) => {
    setReviewItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: "escalated" as const } : item,
      ),
    );
    toast.warning("Issue escalated for review");
  };

  const pendingCount = reviewItems.filter((i) => i.status === "pending").length;
  const criticalCount = reviewItems.filter((i) => i.priority >= 80).length;

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Reinforcement Learning & Feedback
              </h1>
              <p className="text-muted-foreground">
                Monitor, review, and improve AI agent responses
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4 opacity-60 pointer-events-none">
            <FeedbackStatsCard
              title="Pending Reviews"
              value={pendingCount}
              icon={<Clock className="w-5 h-5" />}
              variant="warning"
            />
            <FeedbackStatsCard
              title="Critical Items"
              value={criticalCount}
              icon={<AlertTriangle className="w-5 h-5" />}
              variant="danger"
            />
            <FeedbackStatsCard
              title="Resolved Today"
              value={12}
              trend="up"
              trendValue="+15%"
              icon={<CheckCircle className="w-5 h-5" />}
              variant="success"
            />
            <FeedbackStatsCard
              title="Avg Resolution"
              value="2.4h"
              trend="down"
              trendValue="-18%"
              icon={<Activity className="w-5 h-5" />}
              variant="default"
            />
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="queue" className="flex-1 flex flex-col px-6">
          <TabsList className="w-fit mb-4">
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Agent Performance
              {/* <Badge variant="secondary" className="ml-1">
                {pendingCount}
              </Badge> */}
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Agent Health
            </TabsTrigger>
            <TabsTrigger value="triggers" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Retraining Triggers
            </TabsTrigger>
            <TabsTrigger
              value="improvements"
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Improvements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="flex-1 mt-0 overflow-hidden">
            <div className="flex gap-4 ">
              {/* Left: Queue List */}
              <div className="w-1/2 flex flex-col bg-card rounded-xl border overflow-hidden">
                <div className="p-4 border-b space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions or agents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    {/* <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select> */}
                    {/* <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="negative_feedback">
                          Negative Feedback
                        </SelectItem>
                        <SelectItem value="low_confidence">
                          Low Confidence
                        </SelectItem>
                        <SelectItem value="hallucination">
                          Hallucination
                        </SelectItem>
                      </SelectContent>
                    </Select> */}
                  </div>
                </div>
                <ScrollArea className="flex-1 p-2">
                  <div className="space-y-2 h-[500px] overflow-y-auto">
                    {loading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <AgentPerformanceCardSkeleton key={i} />
                        ))}
                      </div>
                    ) : agentPerformance && agentPerformance.length > 0 ? (
                      agentPerformance?.map((item) => (
                        <AgentPerformanceCard
                          key={item.subject_agent_id}
                          item={item}
                          isSelected={
                            selectedItem?.id === item.subject_agent_id
                          }
                          onSelect={() => {
                            fetchSingalAgentPerformance(item.subject_agent_id);
                          }}
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-xl bg-muted/30">
                        {/* Icon */}
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Brain className="w-7 h-7 text-primary" />
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold mb-1">
                          No Performance Data Found
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground max-w-sm mb-4">
                          We couldn't find any performance insights for your
                          agents yet. Once agents start interacting with
                          students, analytics will appear here.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                          >
                            Refresh
                          </Button>

                          <Button onClick={() => navigate("/admin/agents")}>
                            View Agents
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Right: Detail Panel */}
              <div className="w-1/2 bg-card rounded-xl border overflow-hidden">
                {selectedItem ? (
                  <ReviewDetailPanel
                    item={selectedItem}
                    onResolve={handleResolve}
                    onDismiss={handleDismiss}
                    onEscalate={handleEscalate}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Select an item to review</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="health" className="flex-1 overflow-auto mt-0">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {agentPerformance && agentPerformance.length > 0 ? (
                agentPerformance
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage,
                  )
                  .map((agent) => {
                    const metrics: AgentMetrics = {
                      agentId: agent.subject_agent_id,
                      timestamp: new Date(agent.last_updated),
                      accuracyScore: agent.metrics?.overall_score ?? 0,
                      accuracyTrend: "stable",
                      accuracyDelta: 0,
                      avgConfidence:
                        (agent.metrics?.critical_confidence ?? 0) / 100,
                      confidenceTrend: "stable",
                      confidenceDelta: 0,
                      positiveRate: agent.metrics?.satisfaction_rate ?? 0,
                      negativeRate: 0,
                      feedbackSentiment: 0.5,
                      responseConsistency: 0.8,
                      hallucinationRate:
                        (agent.metrics?.hallucination_risk ?? 0) / 100,
                      healthScore: agent.metrics?.overall_score ?? 0,
                      healthTrend: "stable",
                    };

                    return (
                      <AgentHealthCard
                        key={agent.subject_agent_id}
                        metrics={metrics}
                        agentName={
                          agent.agent_metadata?.agent_name || "Unknown Agent"
                        }
                      />
                    );
                  })
              ) : (
                <div className="col-span-3 text-center py-12">
                  <div className="text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No agent performance data available</p>
                  </div>
                </div>
              )}
            </div>
            {/* Pagination */}
            {totalPages > 1 && !isLoading && (
              <div className="my-6">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={agentPerformance.length}
                  onPageChange={setCurrentPage}
                  isLoading={isLoading}
                />
              </div>
            )}
            <div className="opacity-60 pointer-events-none">
              <FlaggingRulesPanel
                rules={rules}
                onToggleRule={(id, active) =>
                  setRules((r) =>
                    r.map((rule) =>
                      rule.id === id ? { ...rule, isActive: active } : rule,
                    ),
                  )
                }
                onAddRule={() => toast.info("Add rule dialog would open")}
              />
            </div>
          </TabsContent>

          <TabsContent value="triggers" className="flex-1 overflow-auto mt-0">
            <div className="grid grid-cols-3 gap-4">
              {triggers.map((trigger) => (
                <RetrainingTriggerCard
                  key={trigger.id}
                  trigger={trigger}
                  onToggle={(id, active) =>
                    setTriggers((t) =>
                      t.map((tr) =>
                        tr.id === id ? { ...tr, isActive: active } : tr,
                      ),
                    )
                  }
                  onTriggerManually={(id) =>
                    toast.success("Retraining triggered manually")
                  }
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent
            value="improvements"
            className="flex-1 overflow-auto mt-0"
          >
            <div className="grid grid-cols-2 gap-6">
              <ImprovementTimeline actions={mockActions} />
              <div className="space-y-4">
                <FeedbackStatsCard
                  title="Agents Improved (30d)"
                  value={8}
                  trend="up"
                  trendValue="+3"
                  icon={<TrendingUp className="w-5 h-5" />}
                  variant="success"
                />
                <FeedbackStatsCard
                  title="Avg Accuracy Gain"
                  value="+4.2%"
                  icon={<Activity className="w-5 h-5" />}
                  variant="success"
                />
                <FeedbackStatsCard
                  title="Total Corrections"
                  value={47}
                  icon={<RefreshCw className="w-5 h-5" />}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
