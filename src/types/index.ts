/**
 * Type definitions for ProductHunt Scraper App
 * These types align with the database schema and validation schemas
 */

/**
 * Workflow configuration and execution types
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  webhookUrl: string;
  configuration: WorkflowConfiguration;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowConfiguration {
  id: string;
  workflowId: string;
  schedule?: string; // Cron expression
  filters?: {
    minVotes?: number;
    categories?: string[];
    tags?: string[];
  };
  aiAnalysisPrompt?: string;
  notificationSettings?: {
    emailEnabled?: boolean;
    slackEnabled?: boolean;
    webhookEnabled?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  productsProcessed?: number;
  metadata?: Record<string, any>;
}

/**
 * Product types from ProductHunt
 */
export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  productHuntUrl: string;
  thumbnailUrl?: string;
  votesCount: number;
  commentsCount?: number;
  categories: string[];
  tags: string[];
  topics?: ProductTopic[];
  makers?: Maker[];
  featuredAt?: Date;
  launchedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  analysisReports?: AnalysisReport[];
}

export interface ProductTopic {
  id: string;
  name: string;
  slug: string;
}

export interface Maker {
  id: string;
  name: string;
  username: string;
  profileUrl?: string;
  avatarUrl?: string;
  headline?: string;
}

/**
 * Analysis report types
 */
export interface AnalysisReport {
  id: string;
  productId: string;
  product?: Product;
  content: AnalysisContent;
  analysisType: 'market_fit' | 'competitive' | 'sentiment' | 'comprehensive';
  confidence: number; // 0-100
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Structured AI analysis content
 */
export interface AnalysisContent {
  summary: string;
  marketAnalysis?: MarketAnalysis;
  competitiveAnalysis?: CompetitiveAnalysis;
  sentimentAnalysis?: SentimentAnalysis;
  recommendations?: Recommendation[];
  insights?: Insight[];
  risks?: Risk[];
  opportunities?: Opportunity[];
  metrics?: AnalysisMetrics;
  rawAnalysis?: string; // Original AI response
}

export interface MarketAnalysis {
  targetAudience: string[];
  marketSize?: string;
  growthPotential: 'low' | 'medium' | 'high';
  marketTrends: string[];
  productMarketFit: number; // 0-100
  reasoning: string;
}

export interface CompetitiveAnalysis {
  directCompetitors: Competitor[];
  indirectCompetitors: Competitor[];
  uniqueValueProposition: string;
  competitiveAdvantages: string[];
  competitiveDisadvantages: string[];
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
}

export interface Competitor {
  name: string;
  url?: string;
  strengths: string[];
  weaknesses: string[];
  marketShare?: string;
}

export interface SentimentAnalysis {
  overallSentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // -100 to 100
  positiveAspects: string[];
  negativeAspects: string[];
  userFeedback?: UserFeedback[];
}

export interface UserFeedback {
  comment: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: 'product' | 'marketing' | 'technical' | 'business' | 'other';
  timeframe?: 'immediate' | 'short_term' | 'long_term';
}

export interface Insight {
  title: string;
  description: string;
  significance: 'low' | 'medium' | 'high';
  category: string;
  dataPoints?: string[];
}

export interface Risk {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  likelihood: 'low' | 'medium' | 'high';
  mitigation?: string;
}

export interface Opportunity {
  title: string;
  description: string;
  potential: 'low' | 'medium' | 'high';
  timeframe?: 'immediate' | 'short_term' | 'long_term';
  requirements?: string[];
}

export interface AnalysisMetrics {
  innovationScore?: number; // 0-100
  executionScore?: number; // 0-100
  viabilityScore?: number; // 0-100
  scalabilityScore?: number; // 0-100
  overallScore?: number; // 0-100
  customMetrics?: Record<string, number>;
}

/**
 * API Response types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ResponseMetadata {
  timestamp: string;
  requestId?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Webhook payload types
 */
export interface WebhookPayload {
  workflowId: string;
  executionId: string;
  timestamp: string;
  event: 'product_discovered' | 'analysis_completed' | 'workflow_completed' | 'workflow_failed';
  data: ProductWebhookData | AnalysisWebhookData | WorkflowWebhookData;
}

export interface ProductWebhookData {
  product: Product;
  source: 'producthunt' | 'manual' | 'api';
  metadata?: Record<string, any>;
}

export interface AnalysisWebhookData {
  productId: string;
  analysisReport: AnalysisReport;
  triggerType: 'scheduled' | 'manual' | 'webhook';
}

export interface WorkflowWebhookData {
  workflow: Workflow;
  execution: WorkflowExecution;
  summary: {
    productsProcessed: number;
    analysisGenerated: number;
    errors: number;
    duration: number; // in milliseconds
  };
}

/**
 * Filter and search types
 */
export interface ProductFilter {
  search?: string;
  categories?: string[];
  tags?: string[];
  minVotes?: number;
  maxVotes?: number;
  dateRange?: DateRange;
  hasAnalysis?: boolean;
  sortBy?: 'votes' | 'date' | 'name' | 'comments';
  sortOrder?: 'asc' | 'desc';
}

export interface AnalysisFilter {
  productId?: string;
  analysisType?: AnalysisContent['analysisType'];
  minConfidence?: number;
  dateRange?: DateRange;
  sortBy?: 'confidence' | 'date' | 'product_votes';
  sortOrder?: 'asc' | 'desc';
}

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * User and authentication types
 */
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'viewer';
  metadata?: {
    name?: string;
    avatar?: string;
    preferences?: UserPreferences;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  emailNotifications?: boolean;
  defaultFilters?: {
    products?: ProductFilter;
    analysis?: AnalysisFilter;
  };
}

/**
 * Dashboard and statistics types
 */
export interface DashboardStats {
  totalProducts: number;
  totalAnalysis: number;
  activeWorkflows: number;
  recentExecutions: WorkflowExecution[];
  topProducts: Product[];
  analysisBreakdown: {
    byType: Record<string, number>;
    byConfidence: {
      high: number; // 80-100
      medium: number; // 50-79
      low: number; // 0-49
    };
  };
  trends: {
    productsOverTime: TimeSeriesData[];
    analysisOverTime: TimeSeriesData[];
    votesOverTime: TimeSeriesData[];
  };
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}