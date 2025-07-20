import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { db } from './index';
import { workflows, products, analysisReports, workflowExecutions } from './schema';
import type { NewWorkflow, NewProduct, NewAnalysisReport, NewWorkflowExecution } from './schema';

// Workflow operations
export const workflowOperations = {
  // Get all workflows
  getAll: async () => {
    return await db.select().from(workflows).orderBy(desc(workflows.createdAt));
  },

  // Get workflow by ID
  getById: async (id: number) => {
    const result = await db.select().from(workflows).where(eq(workflows.id, id));
    return result[0];
  },

  // Get active workflows by type
  getActiveByType: async (type: 'products' | 'analysis') => {
    return await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.type, type), eq(workflows.isActive, true)));
  },

  // Create new workflow
  create: async (data: NewWorkflow) => {
    const result = await db.insert(workflows).values(data).returning();
    return result[0];
  },

  // Update workflow
  update: async (id: number, data: Partial<NewWorkflow>) => {
    const result = await db
      .update(workflows)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workflows.id, id))
      .returning();
    return result[0];
  },

  // Update last executed time
  updateLastExecuted: async (id: number) => {
    const result = await db
      .update(workflows)
      .set({ lastExecuted: new Date(), updatedAt: new Date() })
      .where(eq(workflows.id, id))
      .returning();
    return result[0];
  },

  // Delete workflow
  delete: async (id: number) => {
    const result = await db.delete(workflows).where(eq(workflows.id, id)).returning();
    return result[0];
  },
};

// Product operations
export const productOperations = {
  // Get all products with optional filtering
  getAll: async (filters?: {
    workflowId?: number;
    startDate?: Date;
    endDate?: Date;
  }) => {
    const conditions = [];
    if (filters?.workflowId) {
      conditions.push(eq(products.workflowId, filters.workflowId));
    }
    if (filters?.startDate) {
      conditions.push(gte(products.scrapedAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(products.scrapedAt, filters.endDate));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    return await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.scrapedAt));
  },

  // Get product by ID
  getById: async (id: number) => {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  },

  // Create new product
  create: async (data: NewProduct) => {
    const result = await db.insert(products).values(data).returning();
    return result[0];
  },

  // Create multiple products
  createMany: async (data: NewProduct[]) => {
    if (data.length === 0) return [];
    const result = await db.insert(products).values(data).returning();
    return result;
  },

  // Delete product
  delete: async (id: number) => {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result[0];
  },
};

// Analysis Report operations
export const analysisOperations = {
  // Get all analysis reports with optional filtering
  getAll: async (filters?: {
    workflowId?: number;
    startDate?: Date;
    endDate?: Date;
  }) => {
    const conditions = [];
    if (filters?.workflowId) {
      conditions.push(eq(analysisReports.workflowId, filters.workflowId));
    }
    if (filters?.startDate) {
      conditions.push(gte(analysisReports.analyzedAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(analysisReports.analyzedAt, filters.endDate));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    return await db
      .select()
      .from(analysisReports)
      .where(whereClause)
      .orderBy(desc(analysisReports.analyzedAt));
  },

  // Get analysis report by ID
  getById: async (id: number) => {
    const result = await db.select().from(analysisReports).where(eq(analysisReports.id, id));
    return result[0];
  },

  // Create new analysis report
  create: async (data: NewAnalysisReport) => {
    const result = await db.insert(analysisReports).values(data).returning();
    return result[0];
  },

  // Delete analysis report
  delete: async (id: number) => {
    const result = await db.delete(analysisReports).where(eq(analysisReports.id, id)).returning();
    return result[0];
  },
};

// Parse JSON content from analysis reports
// Note: With the new schema, content is stored as JSON type, so no parsing needed
export function parseAnalysisContent(content: any): any {
  // Content is already parsed when retrieved from database
  return content;
}

// Format analysis content to JSON (for compatibility)
// Note: With the new schema, content is stored as JSON type, so no stringification needed
export function formatAnalysisContent(content: any): any {
  return content;
}

// Workflow Execution operations
export const workflowExecutionOperations = {
  // Get all workflow executions with optional filtering
  getAll: async (filters?: {
    workflowId?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }) => {
    const conditions = [];
    if (filters?.workflowId) {
      conditions.push(eq(workflowExecutions.workflowId, filters.workflowId));
    }
    if (filters?.status) {
      conditions.push(eq(workflowExecutions.status, filters.status));
    }
    if (filters?.startDate) {
      conditions.push(gte(workflowExecutions.startedAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(workflowExecutions.startedAt, filters.endDate));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    return await db
      .select()
      .from(workflowExecutions)
      .where(whereClause)
      .orderBy(desc(workflowExecutions.startedAt));
  },

  // Get workflow execution by ID
  getById: async (id: number) => {
    const result = await db.select().from(workflowExecutions).where(eq(workflowExecutions.id, id));
    return result[0];
  },

  // Create new workflow execution
  create: async (data: NewWorkflowExecution) => {
    const result = await db.insert(workflowExecutions).values(data).returning();
    return result[0];
  },

  // Update workflow execution
  update: async (id: number, data: Partial<NewWorkflowExecution>) => {
    const result = await db
      .update(workflowExecutions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workflowExecutions.id, id))
      .returning();
    return result[0];
  },

  // Mark execution as completed
  markCompleted: async (id: number, productsProcessed: number = 0) => {
    const result = await db
      .update(workflowExecutions)
      .set({ 
        status: 'completed', 
        completedAt: new Date(),
        productsProcessed,
        updatedAt: new Date() 
      })
      .where(eq(workflowExecutions.id, id))
      .returning();
    return result[0];
  },

  // Mark execution as failed
  markFailed: async (id: number, error: string) => {
    const result = await db
      .update(workflowExecutions)
      .set({ 
        status: 'failed', 
        completedAt: new Date(),
        error,
        updatedAt: new Date() 
      })
      .where(eq(workflowExecutions.id, id))
      .returning();
    return result[0];
  },

  // Delete workflow execution
  delete: async (id: number) => {
    const result = await db.delete(workflowExecutions).where(eq(workflowExecutions.id, id)).returning();
    return result[0];
  },
};