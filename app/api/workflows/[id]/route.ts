import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workflows, products, analysisReports } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { NewWorkflow } from '@/lib/db/schema';
import { 
  checkAdminAuth, 
  unauthorizedResponse, 
  forbiddenResponse, 
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse 
} from '../../utils/auth';

// GET /api/workflows/[id] - Get a specific workflow
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const { user, isAdmin } = await checkAdminAuth();
    
    if (!user) {
      return unauthorizedResponse();
    }

    if (!isAdmin) {
      return forbiddenResponse();
    }

    const workflowId = parseInt(params.id);
    if (isNaN(workflowId)) {
      return badRequestResponse('Invalid workflow ID');
    }

    // Fetch workflow
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, workflowId));

    if (!workflow) {
      return notFoundResponse('Workflow not found');
    }

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return serverErrorResponse();
  }
}

// PUT /api/workflows/[id] - Update a workflow
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const { user, isAdmin } = await checkAdminAuth();
    
    if (!user) {
      return unauthorizedResponse();
    }

    if (!isAdmin) {
      return forbiddenResponse();
    }

    const workflowId = parseInt(params.id);
    if (isNaN(workflowId)) {
      return badRequestResponse('Invalid workflow ID');
    }

    // Check if workflow exists
    const [existingWorkflow] = await db.select().from(workflows).where(eq(workflows.id, workflowId));
    if (!existingWorkflow) {
      return notFoundResponse('Workflow not found');
    }

    // Parse request body
    const body = await request.json();
    
    // Build update object
    const updateData: Partial<NewWorkflow> = {
      updatedAt: new Date(),
    };

    // Validate and add fields if provided
    if (body.name !== undefined) {
      if (!body.name) {
        return badRequestResponse('Name cannot be empty');
      }
      updateData.name = body.name;
    }

    if (body.type !== undefined) {
      if (!['products', 'analysis'].includes(body.type)) {
        return badRequestResponse('Invalid workflow type. Must be "products" or "analysis"');
      }
      updateData.type = body.type;
    }

    if (body.webhookUrl !== undefined) {
      if (!body.webhookUrl) {
        return badRequestResponse('Webhook URL cannot be empty');
      }
      try {
        new URL(body.webhookUrl);
      } catch {
        return badRequestResponse('Invalid webhook URL');
      }
      updateData.webhookUrl = body.webhookUrl;
    }

    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive;
    }

    if (body.lastExecuted !== undefined) {
      updateData.lastExecuted = new Date(body.lastExecuted);
    }

    // Update workflow
    const [updatedWorkflow] = await db.update(workflows)
      .set(updateData)
      .where(eq(workflows.id, workflowId))
      .returning();

    return NextResponse.json({ workflow: updatedWorkflow });
  } catch (error) {
    console.error('Error updating workflow:', error);
    return serverErrorResponse();
  }
}

// DELETE /api/workflows/[id] - Delete a workflow
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const { user, isAdmin } = await checkAdminAuth();
    
    if (!user) {
      return unauthorizedResponse();
    }

    if (!isAdmin) {
      return forbiddenResponse();
    }

    const workflowId = parseInt(params.id);
    if (isNaN(workflowId)) {
      return badRequestResponse('Invalid workflow ID');
    }

    // Check if workflow exists
    const [existingWorkflow] = await db.select().from(workflows).where(eq(workflows.id, workflowId));
    if (!existingWorkflow) {
      return notFoundResponse('Workflow not found');
    }

    // Check if workflow has associated products or analysis reports
    const relatedProducts = await db.select()
      .from(products)
      .where(eq(products.workflowId, workflowId))
      .limit(1);
    
    const relatedReports = await db.select()
      .from(analysisReports)
      .where(eq(analysisReports.workflowId, workflowId))
      .limit(1);

    if (relatedProducts.length > 0 || relatedReports.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete workflow with existing products or analysis reports. Please delete related data first.',
          details: {
            hasProducts: relatedProducts.length > 0,
            hasReports: relatedReports.length > 0
          }
        },
        { status: 400 }
      );
    }

    // Delete workflow
    await db.delete(workflows).where(eq(workflows.id, workflowId));

    return NextResponse.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return serverErrorResponse();
  }
}