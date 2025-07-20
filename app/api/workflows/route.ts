import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workflows } from '@/lib/db/schema';
import type { NewWorkflow } from '@/lib/db/schema';
import { 
  checkAdminAuth, 
  unauthorizedResponse, 
  forbiddenResponse, 
  badRequestResponse,
  serverErrorResponse 
} from '../utils/auth';

// GET /api/workflows - Get all workflows
export async function GET() {
  try {
    // Check authentication and admin role
    const { user, isAdmin } = await checkAdminAuth();
    
    if (!user) {
      return unauthorizedResponse();
    }

    if (!isAdmin) {
      return forbiddenResponse();
    }

    // Fetch all workflows
    const allWorkflows = await db.select().from(workflows).orderBy(workflows.createdAt);

    return NextResponse.json({ workflows: allWorkflows });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return serverErrorResponse();
  }
}

// POST /api/workflows - Create a new workflow
export async function POST(request: Request) {
  try {
    // Check authentication and admin role
    const { user, isAdmin } = await checkAdminAuth();
    
    if (!user) {
      return unauthorizedResponse();
    }

    if (!isAdmin) {
      return forbiddenResponse();
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.type || !body.webhookUrl) {
      return badRequestResponse('Missing required fields: name, type, webhookUrl');
    }

    // Validate workflow type
    if (!['products', 'analysis'].includes(body.type)) {
      return badRequestResponse('Invalid workflow type. Must be "products" or "analysis"');
    }

    // Validate webhook URL
    try {
      new URL(body.webhookUrl);
    } catch {
      return badRequestResponse('Invalid webhook URL');
    }

    // Create new workflow
    const newWorkflow: NewWorkflow = {
      name: body.name,
      type: body.type,
      webhookUrl: body.webhookUrl,
      isActive: body.isActive !== undefined ? body.isActive : true,
      updatedAt: new Date(),
    };

    const [createdWorkflow] = await db.insert(workflows).values(newWorkflow).returning();

    return NextResponse.json({ workflow: createdWorkflow }, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return serverErrorResponse();
  }
}