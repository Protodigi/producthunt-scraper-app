import type { Workflow } from '@/lib/db/schema';

// API Request types
export interface CreateWorkflowRequest {
  name: string;
  type: 'products' | 'analysis';
  webhookUrl: string;
  isActive?: boolean;
}

export interface UpdateWorkflowRequest {
  name?: string;
  type?: 'products' | 'analysis';
  webhookUrl?: string;
  isActive?: boolean;
  lastExecuted?: string | Date;
}

// API Response types
export interface WorkflowResponse {
  workflow: Workflow;
}

export interface WorkflowsResponse {
  workflows: Workflow[];
}

export interface DeleteWorkflowResponse {
  message: string;
}

export interface DeleteWorkflowErrorResponse {
  error: string;
  details?: {
    productsCount: number;
    reportsCount: number;
  };
}

export interface ErrorResponse {
  error: string;
}

// Validation helpers
export function isValidWorkflowType(type: string): type is 'products' | 'analysis' {
  return type === 'products' || type === 'analysis';
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}