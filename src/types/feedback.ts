// ==========================================
// REINFORCEMENT LEARNING & FEEDBACK TYPES
// Production-Ready RLHF System Types
// ==========================================

// ==========================================
// 1. FEEDBACK SIGNAL COLLECTION
// ==========================================

export type ExplicitFeedbackType = 'thumbs_up' | 'thumbs_down' | 'report';
export type ImplicitFeedbackType = 'rephrased_question' | 'abandonment' | 'correction' | 'follow_up';
export type FeedbackSource = 'explicit' | 'implicit' | 'automated';

export interface FeedbackEvent {
  id: string;
  responseId: string;
  agentId: string;
  studentId: string;
  sessionId: string;
  contextHash: string; // Hash of query + context for deduplication
  
  // Feedback details
  type: ExplicitFeedbackType | ImplicitFeedbackType;
  source: FeedbackSource;
  comment?: string;
  
  // Timestamps
  createdAt: Date;
  processedAt?: Date;
  
  // Weight calculation factors
  weight: number;
  weightFactors: WeightFactors;
}

export interface WeightFactors {
  confidenceMultiplier: number;   // Higher weight for low-confidence responses
  frequencyMultiplier: number;    // Higher weight for repeated failures
  recencyMultiplier: number;      // More recent = higher weight
  userReliabilityScore: number;   // Based on user's feedback history
}

// ==========================================
// 2. CONFIDENCE & QUALITY SCORING
// ==========================================

export interface QualityScore {
  id: string;
  responseId: string;
  
  // Multi-factor scoring (0-1 normalized)
  modelCertainty: number;         // Token probability / logprobs
  ragRelevance: number;           // Vector similarity score
  answerCompleteness: number;     // Intent coverage
  hallucinationRisk: number;      // Risk indicator (0 = safe, 1 = high risk)
  
  // Composite scores
  overallScore: number;           // Weighted average
  confidenceBucket: ConfidenceBucket;
  
  // Metadata
  calculatedAt: Date;
  version: string;                // Scoring algorithm version
}

export type ConfidenceBucket = 'high' | 'medium' | 'low' | 'critical';

export interface ConfidenceThresholds {
  high: { min: number; max: number };      // 0.85 - 1.0
  medium: { min: number; max: number };    // 0.65 - 0.85
  low: { min: number; max: number };       // 0.45 - 0.65
  critical: { min: number; max: number };  // 0.0 - 0.45
}

// Auto-flag rules
export interface FlaggingRule {
  id: string;
  name: string;
  description: string;
  condition: string;              // Pseudocode condition
  priority: 'critical' | 'high' | 'medium' | 'low';
  isActive: boolean;
  createdAt: Date;
}

// ==========================================
// 3. FAILURE DETECTION & REVIEW QUEUE
// ==========================================

export type ReviewStatus = 'pending' | 'in_review' | 'resolved' | 'escalated' | 'dismissed';
export type FailureType = 'negative_feedback' | 'low_confidence' | 'hallucination' | 'repeat_failure' | 'pattern_detected';

export interface ReviewItem {
  id: string;
  responseId: string;
  agentId: string;
  agentName: string;
  agentVersion: string;
  
  // Original interaction
  studentQuery: string;
  aiResponse: string;
  conversationContext: string[];  // Previous messages for context
  
  // Diagnostic data
  qualityScore: QualityScore;
  feedbackEvents: FeedbackEvent[];
  sourcesUsed: SourceChunk[];
  promptVersion: string;
  
  // Classification
  failureType: FailureType;
  priority: number;               // 1-100, higher = more urgent
  priorityFactors: PriorityFactors;
  
  // Status tracking
  status: ReviewStatus;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  
  // Resolution
  resolution?: Resolution;
}

export interface SourceChunk {
  id: string;
  documentName: string;
  content: string;
  relevanceScore: number;
  chunkIndex: number;
}

export interface PriorityFactors {
  failureFrequency: number;       // How often this type of failure occurs
  studentImpact: number;          // Number of students affected
  topicImportance: number;        // Based on curriculum weight
  timeSensitivity: number;        // How urgently it needs resolution
}

// ==========================================
// 4. ADMIN REVIEW & CORRECTION WORKFLOW
// ==========================================

export type CorrectionType = 'prompt_edit' | 'rag_update' | 'knowledge_add' | 'knowledge_remove' | 'config_change';
export type ResolutionState = 'pending_validation' | 'validated' | 'deployed' | 'rolled_back';

export interface Resolution {
  id: string;
  reviewItemId: string;
  resolvedBy: string;
  resolvedAt: Date;
  
  // Correction details
  correctionType: CorrectionType;
  correction: Correction;
  
  // Validation
  state: ResolutionState;
  validationResults?: ValidationResult;
  deployedAt?: Date;
  
  // Impact tracking
  impactMetrics?: ImpactMetrics;
  notes: string;
}

export interface Correction {
  type: CorrectionType;
  
  // For prompt corrections
  originalPrompt?: string;
  updatedPrompt?: string;
  promptDiff?: string;
  
  // For RAG corrections
  documentsAdded?: string[];
  documentsRemoved?: string[];
  chunksUpdated?: string[];
  
  // For config changes
  configChanges?: Record<string, { old: any; new: any }>;
}

export interface ValidationResult {
  testCasesPassed: number;
  testCasesFailed: number;
  regressionDetected: boolean;
  confidenceImprovement: number;
  validatedAt: Date;
}

export interface ImpactMetrics {
  accuracyBefore: number;
  accuracyAfter: number;
  confidenceBefore: number;
  confidenceAfter: number;
  similarFailuresResolved: number;
  measurementPeriod: string;      // e.g., "7d"
}

// ==========================================
// 5. REINFORCEMENT STRATEGY
// ==========================================

export type ReinforcementStage = 'prompt_reinforcement' | 'rag_optimization' | 'fine_tuning';

export interface ReinforcementAction {
  id: string;
  agentId: string;
  stage: ReinforcementStage;
  
  // Trigger
  triggerType: 'automatic' | 'manual';
  triggerReason: string;
  
  // Action details
  changes: Correction[];
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  
  // Results
  beforeMetrics: AgentMetrics;
  afterMetrics?: AgentMetrics;
  rollbackAvailable: boolean;
}

// ==========================================
// 6. RETRAINING TRIGGERS
// ==========================================

export interface RetrainingTrigger {
  id: string;
  name: string;
  description: string;
  
  // Thresholds
  thresholdType: 'quantitative' | 'pattern_based' | 'time_based';
  condition: RetrainingCondition;
  
  // Approval
  autoApprove: boolean;
  approvalRequired: string[];     // Role IDs that need to approve
  
  // Status
  isActive: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface RetrainingCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  windowPeriod: string;           // e.g., "7d", "30d"
  minimumSamples: number;
}

// ==========================================
// 7. CONTINUOUS IMPROVEMENT METRICS
// ==========================================

export interface AgentMetrics {
  agentId: string;
  timestamp: Date;
  
  // Accuracy metrics
  accuracyScore: number;          // 0-100
  accuracyTrend: TrendDirection;
  accuracyDelta: number;
  
  // Confidence metrics
  avgConfidence: number;          // 0-1
  confidenceTrend: TrendDirection;
  confidenceDelta: number;
  
  // Feedback metrics
  positiveRate: number;           // % positive feedback
  negativeRate: number;           // % negative feedback
  feedbackSentiment: number;      // -1 to 1
  
  // Stability metrics
  responseConsistency: number;    // 0-1
  hallucinationRate: number;      // % of flagged hallucinations
  
  // Composite
  healthScore: number;            // 0-100, weighted composite
  healthTrend: TrendDirection;
}

export type TrendDirection = 'improving' | 'stable' | 'declining';

export interface AgentHealthFormula {
  accuracyWeight: number;         // e.g., 0.35
  confidenceWeight: number;       // e.g., 0.25
  feedbackWeight: number;         // e.g., 0.20
  stabilityWeight: number;        // e.g., 0.20
}

// ==========================================
// 8. SAFETY & GOVERNANCE
// ==========================================

export interface AgentVersion {
  id: string;
  agentId: string;
  version: string;
  
  // Configuration snapshot
  promptSnapshot: string;
  ragConfigSnapshot: Record<string, any>;
  modelConfigSnapshot: Record<string, any>;
  
  // Metadata
  createdAt: Date;
  createdBy: string;
  changeDescription: string;
  
  // Deployment
  deployedAt?: Date;
  isActive: boolean;
  canRollback: boolean;
}

export interface DeploymentValidation {
  id: string;
  versionId: string;
  
  // Validation checks
  syntaxValid: boolean;
  testsPassed: boolean;
  regressionClean: boolean;
  canaryPassed: boolean;
  
  // Results
  overallValid: boolean;
  validatedAt: Date;
  validatedBy: string;
  notes: string;
}

export interface CanaryDeployment {
  id: string;
  versionId: string;
  
  // Rollout config
  rolloutPercentage: number;      // % of traffic
  targetStudentSegment?: string;
  
  // Monitoring
  startedAt: Date;
  endAt: Date;
  
  // Results
  metrics: AgentMetrics;
  issues: string[];
  approved: boolean;
}

// ==========================================
// 9. DASHBOARD AGGREGATES
// ==========================================

export interface FeedbackDashboardStats {
  pendingReviews: number;
  criticalItems: number;
  resolvedToday: number;
  avgResolutionTime: number;      // in hours
  
  // By type
  byType: Record<FailureType, number>;
  byPriority: Record<string, number>;
  byAgent: Record<string, number>;
  
  // Trends
  dailyVolume: Array<{ date: string; count: number }>;
  resolutionRate: number;         // % resolved within SLA
}

export interface ImprovementSummary {
  period: string;
  agentsImproved: number;
  totalCorrections: number;
  avgAccuracyGain: number;
  avgConfidenceGain: number;
  retrainingActions: number;
}
