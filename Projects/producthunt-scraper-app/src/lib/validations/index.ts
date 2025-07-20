import { z } from 'zod';

// Schema for n8n product webhook data
export const productWebhookSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  tagline: z.string().min(1, 'Product tagline is required'),
  description: z.string().optional(),
  url: z.string().url('Invalid product URL'),
  websiteUrl: z.string().url('Invalid website URL').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
  topics: z.array(z.string()).default([]),
  votesCount: z.number().int().min(0).default(0),
  commentsCount: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  featuredAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  makersCount: z.number().int().min(0).default(0),
  makers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    username: z.string(),
    profileUrl: z.string().url().optional(),
    avatarUrl: z.string().url().optional(),
  })).default([]),
  hunter: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string(),
    profileUrl: z.string().url().optional(),
    avatarUrl: z.string().url().optional(),
  }).optional(),
  workflowExecutionId: z.string().optional(),
  webhookReceivedAt: z.string().datetime().optional(),
});

// Schema for n8n analysis webhook data
export const analysisWebhookSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  workflowExecutionId: z.string().min(1, 'Workflow execution ID is required'),
  analysisType: z.enum(['market_fit', 'competitor', 'sentiment', 'feature', 'comprehensive']),
  analysisResult: z.object({
    summary: z.string().min(1, 'Analysis summary is required'),
    score: z.number().min(0).max(100).optional(),
    insights: z.array(z.object({
      category: z.string(),
      finding: z.string(),
      importance: z.enum(['high', 'medium', 'low']),
      recommendation: z.string().optional(),
    })).default([]),
    competitors: z.array(z.object({
      name: z.string(),
      url: z.string().url().optional(),
      strengths: z.array(z.string()).default([]),
      weaknesses: z.array(z.string()).default([]),
      marketShare: z.number().min(0).max(100).optional(),
    })).optional(),
    marketMetrics: z.object({
      totalAddressableMarket: z.string().optional(),
      growthRate: z.number().optional(),
      marketMaturity: z.enum(['emerging', 'growing', 'mature', 'declining']).optional(),
      barriers: z.array(z.string()).default([]),
    }).optional(),
    sentimentAnalysis: z.object({
      overall: z.enum(['very_positive', 'positive', 'neutral', 'negative', 'very_negative']),
      breakdown: z.object({
        positive: z.number().min(0).max(100),
        neutral: z.number().min(0).max(100),
        negative: z.number().min(0).max(100),
      }).optional(),
      topComments: z.array(z.object({
        text: z.string(),
        sentiment: z.enum(['positive', 'neutral', 'negative']),
        relevance: z.number().min(0).max(1),
      })).default([]),
    }).optional(),
    recommendations: z.array(z.string()).default([]),
    risks: z.array(z.string()).default([]),
    opportunities: z.array(z.string()).default([]),
  }),
  metadata: z.object({
    modelUsed: z.string().optional(),
    processingTime: z.number().optional(),
    confidence: z.number().min(0).max(1).optional(),
    dataPoints: z.number().int().min(0).optional(),
  }).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).default('completed'),
  error: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

// Schema for workflow CRUD operations
export const workflowSchema = z.object({
  id: z.string().uuid().optional(), // Optional for creation, required for updates
  name: z.string().min(1, 'Workflow name is required').max(255),
  description: z.string().max(1000).optional(),
  workflowType: z.enum(['product_scraper', 'analysis_runner', 'data_pipeline', 'custom']),
  n8nWorkflowId: z.string().min(1, 'n8n workflow ID is required'),
  webhookUrl: z.string().url('Invalid webhook URL'),
  isActive: z.boolean().default(true),
  configuration: z.object({
    schedule: z.object({
      enabled: z.boolean().default(false),
      cronExpression: z.string().optional(),
      timezone: z.string().default('UTC'),
    }).optional(),
    triggers: z.array(z.object({
      type: z.enum(['webhook', 'schedule', 'manual', 'event']),
      conditions: z.record(z.any()).optional(),
    })).default([]),
    parameters: z.record(z.any()).default({}),
    retryPolicy: z.object({
      maxRetries: z.number().int().min(0).max(10).default(3),
      retryDelay: z.number().int().min(0).default(1000), // milliseconds
      backoffMultiplier: z.number().min(1).max(5).default(2),
    }).optional(),
    timeout: z.number().int().min(0).default(300000), // 5 minutes default
    notifications: z.object({
      onSuccess: z.boolean().default(false),
      onFailure: z.boolean().default(true),
      channels: z.array(z.enum(['email', 'slack', 'webhook'])).default([]),
    }).optional(),
  }).default({}),
  metadata: z.record(z.any()).default({}),
  lastExecutionAt: z.string().datetime().nullable().optional(),
  lastExecutionStatus: z.enum(['success', 'failure', 'timeout', 'cancelled']).nullable().optional(),
  executionCount: z.number().int().min(0).default(0),
  successCount: z.number().int().min(0).default(0),
  failureCount: z.number().int().min(0).default(0),
  averageExecutionTime: z.number().min(0).nullable().optional(), // milliseconds
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Type inference from schemas
export type ProductWebhook = z.infer<typeof productWebhookSchema>;
export type AnalysisWebhook = z.infer<typeof analysisWebhookSchema>;
export type Workflow = z.infer<typeof workflowSchema>;

// Create schema for workflow creation (without id and timestamps)
export const workflowCreateSchema = workflowSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastExecutionAt: true,
  lastExecutionStatus: true,
  executionCount: true,
  successCount: true,
  failureCount: true,
  averageExecutionTime: true,
});

// Create schema for workflow update (partial with required id)
export const workflowUpdateSchema = workflowSchema.partial().required({
  id: true,
});

// Type inference for create and update operations
export type WorkflowCreate = z.infer<typeof workflowCreateSchema>;
export type WorkflowUpdate = z.infer<typeof workflowUpdateSchema>;

// Validation helper functions
export const validateProductWebhook = (data: unknown) => {
  return productWebhookSchema.safeParse(data);
};

export const validateAnalysisWebhook = (data: unknown) => {
  return analysisWebhookSchema.safeParse(data);
};

export const validateWorkflow = (data: unknown) => {
  return workflowSchema.safeParse(data);
};

export const validateWorkflowCreate = (data: unknown) => {
  return workflowCreateSchema.safeParse(data);
};

export const validateWorkflowUpdate = (data: unknown) => {
  return workflowUpdateSchema.safeParse(data);
};