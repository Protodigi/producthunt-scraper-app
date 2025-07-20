import { pgTable, serial, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
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
  overview: text('overview'),
  productHuntUrl: text('product_hunt_url'),
  workflowId: integer('workflow_id').references(() => workflows.id),
  scrapedAt: timestamp('scraped_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Analysis Reports table - stores AI analysis results
export const analysisReports = pgTable('analysis_reports', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(), // JSON string containing analysis data
  productsAnalyzed: integer('products_analyzed').notNull(),
  workflowId: integer('workflow_id').references(() => workflows.id),
  analyzedAt: timestamp('analyzed_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const workflowsRelations = relations(workflows, ({ many }) => ({
  products: many(products),
  analysisReports: many(analysisReports),
}));

export const productsRelations = relations(products, ({ one }) => ({
  workflow: one(workflows, {
    fields: [products.workflowId],
    references: [workflows.id],
  }),
}));

export const analysisReportsRelations = relations(analysisReports, ({ one }) => ({
  workflow: one(workflows, {
    fields: [analysisReports.workflowId],
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