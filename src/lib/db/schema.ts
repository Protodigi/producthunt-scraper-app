import { pgTable, serial, text, boolean, timestamp, integer, json, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Workflows table - manages n8n workflow configurations
export const workflows = pgTable('workflows', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'products' | 'analysis'
  webhookUrl: text('webhook_url').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastExecuted: timestamp('last_executed'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Products table - stores ProductHunt product data
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  tagline: text('tagline').notNull(),
  description: text('description'),
  url: text('url').notNull(),
  productHuntUrl: text('product_hunt_url'),
  thumbnailUrl: text('thumbnail_url'),
  votesCount: integer('votes_count').default(0).notNull(),
  commentsCount: integer('comments_count').default(0),
  categories: json('categories').notNull(),
  tags: json('tags').notNull(),
  featuredAt: timestamp('featured_at'),
  launchedAt: timestamp('launched_at'),
  workflowId: integer('workflow_id').references(() => workflows.id),
  scrapedAt: timestamp('scraped_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Analysis Reports table - stores AI analysis results
export const analysisReports = pgTable('analysis_reports', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  title: text('title').notNull(),
  content: json('content').notNull(), // Structured analysis data
  analysisType: text('analysis_type').notNull(), // 'market_fit' | 'competitive' | 'sentiment' | 'comprehensive'
  confidence: decimal('confidence', { precision: 5, scale: 2 }).notNull(), // 0-100
  version: text('version').default('1.0').notNull(),
  productsAnalyzed: integer('products_analyzed').notNull(),
  workflowId: integer('workflow_id').references(() => workflows.id),
  analyzedAt: timestamp('analyzed_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workflow Executions table - tracks execution history
export const workflowExecutions = pgTable('workflow_executions', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').references(() => workflows.id).notNull(),
  status: text('status').notNull(), // 'pending' | 'running' | 'completed' | 'failed'
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  error: text('error'),
  productsProcessed: integer('products_processed').default(0),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const workflowsRelations = relations(workflows, ({ many }) => ({
  products: many(products),
  analysisReports: many(analysisReports),
  workflowExecutions: many(workflowExecutions),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  workflow: one(workflows, {
    fields: [products.workflowId],
    references: [workflows.id],
  }),
  analysisReports: many(analysisReports),
}));

export const analysisReportsRelations = relations(analysisReports, ({ one }) => ({
  product: one(products, {
    fields: [analysisReports.productId],
    references: [products.id],
  }),
  workflow: one(workflows, {
    fields: [analysisReports.workflowId],
    references: [workflows.id],
  }),
}));

export const workflowExecutionsRelations = relations(workflowExecutions, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowExecutions.workflowId],
    references: [workflows.id],
  }),
}));

// Type exports for TypeScript
export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type AnalysisReport = typeof analysisReports.$inferSelect;
export type NewAnalysisReport = typeof analysisReports.$inferInsert;
export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type NewWorkflowExecution = typeof workflowExecutions.$inferInsert;