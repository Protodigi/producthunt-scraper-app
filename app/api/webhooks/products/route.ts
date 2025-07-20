import { NextRequest, NextResponse } from 'next/server';
import { db, products, workflows } from '../../../../src/lib/db';
import { validateProductWebhook } from '../../../../src/lib/validations';
import { eq } from 'drizzle-orm';

// POST endpoint to receive product data from n8n
export async function POST(request: NextRequest) {
  try {
    // Log the webhook reception
    console.log('📥 Received product webhook from n8n');

    // Parse the request body
    const body = await request.json();
    console.log('Webhook payload:', JSON.stringify(body, null, 2));

    // Validate the incoming data
    const validationResult = validateProductWebhook(body);
    
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.format());
      return NextResponse.json(
        { 
          error: 'Invalid product data', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    const productData = validationResult.data;

    // Extract workflow execution ID if provided
    const workflowExecutionId = productData.workflowExecutionId;
    
    // Find the workflow if execution ID is provided
    let workflowId: number | null = null;
    if (workflowExecutionId) {
      // Try to find the products workflow
      const productWorkflow = await db
        .select()
        .from(workflows)
        .where(eq(workflows.type, 'products'))
        .limit(1);
      
      if (productWorkflow.length > 0) {
        workflowId = productWorkflow[0].id;
        
        // Update workflow last executed timestamp
        await db
          .update(workflows)
          .set({ 
            lastExecuted: new Date(),
            updatedAt: new Date()
          })
          .where(eq(workflows.id, workflowId));
      }
    }

    // Prepare product data for insertion
    const newProduct = {
      name: productData.name,
      tagline: productData.tagline,
      description: productData.description || null,
      url: productData.url,
      productHuntUrl: productData.url,
      thumbnailUrl: productData.thumbnailUrl || null,
      votesCount: productData.votesCount || 0,
      commentsCount: productData.commentsCount || 0,
      categories: productData.topics || [],
      tags: productData.topics || [], // Using topics as tags since there's no separate tags field
      featuredAt: productData.featured ? new Date(productData.createdAt) : null,
      launchedAt: new Date(productData.createdAt),
      workflowId: workflowId,
      scrapedAt: new Date(productData.createdAt),
    };

    // Insert the product into the database
    const [insertedProduct] = await db
      .insert(products)
      .values(newProduct)
      .returning();

    console.log('✅ Product saved successfully:', insertedProduct.id);

    // Store additional metadata in a separate table if needed
    // This could include makers, hunter, topics, etc.
    // For now, we're storing the basic product information

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Product data received and stored successfully',
        data: {
          productId: insertedProduct.id,
          productName: insertedProduct.name,
          receivedAt: new Date().toISOString(),
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error processing product webhook:', error);
    
    // Check if it's a database error
    if (error instanceof Error) {
      // Log detailed error for debugging
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      { 
        error: 'Failed to process product webhook',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  try {
    // Check database connection
    await db.select().from(workflows).limit(1);
    
    return NextResponse.json(
      { 
        status: 'healthy',
        endpoint: '/api/webhooks/products',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Database connection failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}